from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import reviews

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fynd AI Feedback System")

# Configure CORS
# In production, you would replace "*" with the actual frontend domain
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(reviews.router)

@app.get("/")
def read_root():
    return {"message": "Fynd AI Feedback System API is running"}
