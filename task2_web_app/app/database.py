from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Build DB URL from environment variables or default to local postgres
# Format: postgresql://user:password@localhost/dbname
DB_USER = os.getenv("DB_USER", "sakshampoply") # Defaulting to system user
DB_PASSWORD = os.getenv("DB_PASSWORD", "")     # Defaulting to empty
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "fynd_reviews")

SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

# PostgreSQL does NOT need check_same_thread
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for API endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
