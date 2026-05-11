from fastapi import APIRouter
import httpx
import os
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token
from app.models.review import Review
import json 
from app.db.session import SessionLocal   
from app.models.user import User  
from app.core.security import create_access_token
from app.services.llm_service import review_code
from app.core.job_store import create_job, set_job_result
import asyncio
from app.core.job_store import get_job
from fastapi import Request
from app.core.rate_limiter import is_rate_limited, get_remaining
load_dotenv()

router = APIRouter()
security = HTTPBearer()

CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
@router.get("/github/login")
def github_login():
    return {
        "url": f"https://github.com/login/oauth/authorize?client_id={CLIENT_ID}"
    }
@router.get("/github/callback")
async def github_callback(code: str):
    async with httpx.AsyncClient() as client:

        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )

        token_data = token_res.json()
        print("TOKEN DATA:", token_data)

        access_token = token_data.get("access_token")

        if not access_token:
            return {
                "error": "Failed to get access token",
                "details": token_data
            }

        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        user_data = user_res.json()
        print("USER DATA:", user_data)

        # ✅ DB LOGIC
        db = SessionLocal()

        try:
            user = db.query(User).filter(
                User.github_id == str(user_data["id"])
            ).first()

            if not user:
                print("Creating new user...")

                user = User(
                    email=user_data.get("email"),
                    github_id=str(user_data["id"])
                )
                db.add(user)
                db.commit()
                db.refresh(user)

                print("User created:", user.id)
            else:
                print("User already exists:", user.id)

            # ✅ CREATE TOKEN (outside if/else)
            token = create_access_token({
                "user_id": user.id
            })

        finally:
            db.close()

        return {
            "access_token": token,
            "token_type": "bearer"
        }
@router.get("/me")
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("user_id")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "id": user.id,
            "github_id": user.github_id,
            "email": user.email
        }
    finally:
        db.close()
@router.get("/repo")
async def fetch_repo(repo_url: str, request: Request):

    # ✅ Rate limit by IP
    ip = request.client.host
    if is_rate_limited(ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Max 5 reviews per hour."
        )

    repo_url = repo_url.rstrip("/")
    parts = repo_url.split("/")
    owner = parts[-2].strip()
    repo = parts[-1].strip()

    db = SessionLocal()
    try:
        existing = db.query(Review).filter(Review.repo_url == repo_url).first()
        if existing:
            print("⚡ CACHE HIT")
            return {
                "files_analyzed": existing.files.split(","),
                "review": json.loads(existing.review),
                "cached": True,
                "remaining_requests": get_remaining(ip)
            }
    finally:
        db.close()

    job_id = create_job()
    asyncio.create_task(process_repo(job_id, repo_url, owner, repo))

    return {
        "job_id": job_id,
        "status": "processing",
        "remaining_requests": get_remaining(ip)
    }
@router.get("/reviews")
def get_reviews():
    db = SessionLocal()

    try:
        reviews = db.query(Review).all()

        return [
            {
                "id": r.id,
                "repo_url": r.repo_url,
                "files": r.files,
                "review": json.loads(r.review)
            }
            for r in reviews
        ]

    finally:
        db.close()
async def process_repo(job_id, repo_url, owner, repo):
    from app.services.github_service import get_repo_files, get_file_content
    from app.services.llm_service import review_file
    import asyncio

    try:
        files = await get_repo_files(owner, repo)
    except Exception as e:
        set_job_result(job_id, {
            "files_analyzed": [],
            "review": {
                "per_file": [],
                "bugs": [f"Could not fetch repo: {str(e)}"],
                "improvements": [],
                "code_quality": []
            }
        })
        return

    # ✅ Limit to 10 files for per-file review (avoid Groq rate limits)
    files = files[:10]

    per_file_results = []
    all_bugs = []
    all_improvements = []
    all_quality = []

    for file in files:
        content = await get_file_content(owner, repo, file["path"])
        if not content.strip():
            continue

        # ✅ Review each file individually
        result = await review_file(file["path"], content)

        per_file_results.append({
            "path": file["path"],
            "name": file["name"],
            "bugs": result.get("bugs", []),
            "improvements": result.get("improvements", []),
            "code_quality": result.get("code_quality", [])
        })

        # ✅ Aggregate into overall summary
        all_bugs.extend(result.get("bugs", []))
        all_improvements.extend(result.get("improvements", []))
        all_quality.extend(result.get("code_quality", []))

        # ✅ Small delay to avoid Groq rate limits
        await asyncio.sleep(0.5)

    if not per_file_results:
        set_job_result(job_id, {
            "files_analyzed": [],
            "review": {
                "per_file": [],
                "bugs": ["Could not extract code"],
                "improvements": [],
                "code_quality": []
            }
        })
        return

    review = {
        "per_file": per_file_results,   # ✅ per-file breakdown
        "bugs": all_bugs,               # ✅ overall summary
        "improvements": all_improvements,
        "code_quality": all_quality
    }

    db = SessionLocal()
    try:
        new_review = Review(
            repo_url=repo_url,
            files=",".join([f["name"] for f in files]),
            review=json.dumps(review)
        )
        db.add(new_review)
        db.commit()
    finally:
        db.close()

    set_job_result(job_id, {
        "files_analyzed": [f["name"] for f in files],
        "review": review
    })
@router.get("/job/{job_id}")
def get_job_status(job_id: str):
    job = get_job(job_id)

    if not job:
        return {"error": "Job not found"}

    return job