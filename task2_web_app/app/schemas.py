from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Base Schema
class ReviewBase(BaseModel):
    business_name: str
    stars: int
    text: str

# Schema for Creation (Input)
class ReviewCreate(ReviewBase):
    pass

# Schema for Reading (Output)
class ReviewResponse(ReviewBase):
    id: int
    sentiment_analysis: Optional[str] = None
    recommended_action: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
