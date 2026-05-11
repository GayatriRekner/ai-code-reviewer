
from fastapi import FastAPI
from app.db.session import engine
from app.db.base import Base
from app.api.v1.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
import app.models  

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for development (later restrict)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth")
# create tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"message": "Backend running successfully 🚀"}

@app.get("/health")
def health():
    return {"status": "ok"}