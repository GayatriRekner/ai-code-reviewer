from sqlalchemy import Column, Integer, Text, String
from app.db.base import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    repo_url = Column(String(255))
    files = Column(Text)       # store file names
    review = Column(Text)      # store JSON as string