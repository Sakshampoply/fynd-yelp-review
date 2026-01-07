from sqlalchemy.orm import Session
from . import models, schemas
from .ai_service import analyze_review

def create_review(db: Session, review: schemas.ReviewCreate):
    # Call AI Service
    ai_result = analyze_review(review.text, review.stars, review.business_name)
    
    db_review = models.Review(
        business_name=review.business_name,
        stars=review.stars,
        text=review.text,
        sentiment_analysis=ai_result.get("summary", "Analysis Failed"),
        recommended_action=ai_result.get("recommended_action", "Review Manually")
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_reviews(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Review).offset(skip).limit(limit).all()
