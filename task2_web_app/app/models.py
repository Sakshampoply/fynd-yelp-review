from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from .database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String, index=True, nullable=False, default="Unknown Business") # Changed default for migration safety
    stars = Column(Integer, index=True)
    text = Column(Text, nullable=False)
    
    # Fields to be populated by AI
    sentiment_analysis = Column(Text, nullable=True) # or "summary"
    recommended_action = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
