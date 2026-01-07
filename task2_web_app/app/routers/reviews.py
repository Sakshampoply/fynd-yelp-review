from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from typing import List
import asyncio
import json
from .. import crud, schemas, database

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"]
)

# Store active connections
clients = []

@router.get("/events")
async def get_events(request: Request):
    """
    SSE Endpoint for real-time updates.
    """
    async def event_generator():
        queue = asyncio.Queue()
        clients.append(queue)
        try:
            while True:
                # Check if client connection was closed
                if await request.is_disconnected():
                    break
                
                # Wait for data (review)
                data = await queue.get()
                yield f"data: {json.dumps(data)}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            clients.remove(queue)
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/")
async def submit_review(review: schemas.ReviewCreate, db: Session = Depends(database.get_db)):
    """
    Submit a new review and notify listeners via SSE.
    """
    # Run sync DB operation in threadpool to avoid blocking async loop
    new_review = await run_in_threadpool(crud.create_review, db=db, review=review)
    
    # Prepare data for SSE
    review_data = {
        "id": new_review.id,
        "business_name": new_review.business_name,
        "stars": new_review.stars,
        "text": new_review.text,
        "sentiment_analysis": new_review.sentiment_analysis,
        "recommended_action": new_review.recommended_action,
        "created_at": new_review.created_at.isoformat() if new_review.created_at else None
    }
    
    # Broadcast to all connected clients
    for queue in clients:
        await queue.put(review_data)

    return new_review

@router.get("/", response_model=List[schemas.ReviewResponse])
def read_reviews(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    """
    Get all reviews (for Admin Dashboard).
    """
    reviews = crud.get_reviews(db, skip=skip, limit=limit)
    return reviews
