# ⌬ CodeReview.ai

> AI-powered code review for any public GitHub repository — instant, per-file, deep analysis.

![CodeReview.ai Dashboard](./screenshots/dashboard.png)

---

## 🚀 Live Demo

🔗 **[codereview.ai](https://your-deployed-url.vercel.app)** ← *(update after deploying)*

---

## 📌 What It Does

Paste any public GitHub repository URL and get an instant AI-powered code review:

-  **Bug Detection** — identifies potential bugs and error-prone patterns per file
-  **Improvements** — suggests specific, actionable improvements
-  **Code Quality** — highlights style, naming, and maintainability issues
-  **Quality Score** — per-repo health score calculated from findings
-  **Per-File Breakdown** — each file reviewed individually, not as a blob

---

## 🏗️ Architecture

```
User
 │
 ▼
React Frontend (Vite)
 │  ← paste GitHub repo URL
 ▼
FastAPI Backend
 ├── GitHub Git Tree API     → fetches entire repo file tree (single request)
 ├── IP-based Rate Limiter   → max 5 reviews/hour per user
 ├── MySQL Cache             → skips LLM call if repo already reviewed
 ├── Async Job Queue         → non-blocking background processing
 │
 └── Groq API (LLaMA 3.3 70B, 128k context)
      └── Per-file prompts → structured JSON response
           └── { bugs, improvements, code_quality }
```

---

## ⚙️ Tech Stack

Frontend          : React 18, Vite, Axios
Backend           : Python, FastAPI, SQLAlchemy
Database          : MySQL
AI Model          : LLaMA 3.3 70B via Groq API
GitHub Integration: GitHub Git Tree API + Personal Access Token
Authentication    : JWT (python-jose)
Deployment        : Vercel (Frontend) + Railway (Backend)

---

## ✨ Key Technical Decisions

**1. Git Tree API over `/contents` API**
The `/contents` endpoint only returns top-level files. For complex repos with nested directories, this silently misses most of the codebase. The Git Tree API fetches the entire file tree in a single request — reducing API calls from N (one per folder) to 1.

**2. Per-file LLM prompting**
Instead of concatenating all files into one giant prompt, each file is sent to Groq individually. This produces more specific, accurate feedback (the model focuses on one file at a time) and avoids token overflow on large repos.

**3. Async job queue with polling**
Code review takes 10–30 seconds for large repos. Instead of blocking the HTTP request, the backend creates a job immediately, processes async in the background, and the frontend polls every 2 seconds. This prevents timeouts and gives a smooth UX.

**4. DB caching layer**
Reviewed repos are cached in MySQL. If the same repo URL is submitted again, the backend returns the cached result instantly — no GitHub API call, no LLM call. This reduces cost and latency by ~100% for repeat requests.

**5. IP-based rate limiting**
In-memory rate limiter (no Redis needed) tracks requests per IP address with a sliding window. Max 5 reviews/hour — prevents API abuse and runaway Groq costs.

---

## 📦 Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL running locally
- [Groq API key](https://console.groq.com)
- [GitHub Personal Access Token](https://github.com/settings/tokens)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup .env
cp .env.example .env
# Fill in your keys (see below)

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### `.env` (backend)

```env
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/code_reviewer
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_TOKEN=ghp_your_personal_access_token
GROQ_API_KEY=gsk_your_groq_api_key
SECRET_KEY=your_random_secret_key
```

---

## 📁 Project Structure

```
ai-code-review-assistant/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── __pycache__/
│   │   │       └── auth.py                 # authentication & API route handlers
│   │   │
│   │   ├── core/
│   │   │   ├── __pycache__/
│   │   │   ├── job_store.py               # async job management
│   │   │   ├── rate_limiter.py            # IP-based rate limiting
│   │   │   └── security.py                # JWT auth & token handling
│   │   │
│   │   ├── db/
│   │   │   ├── __pycache__/
│   │   │   ├── base.py                    # database base model
│   │   │   └── session.py                 # database session setup
│   │   │
│   │   ├── models/
│   │   │   ├── __pycache__/
│   │   │   ├── __init__.py
│   │   │   ├── review.py                  # review model/schema
│   │   │   └── user.py                    # user model/schema
│   │   │
│   │   ├── services/
│   │   │   ├── __pycache__/
│   │   │   ├── github_service.py          # GitHub API integration
│   │   │   └── llm_service.py             # Groq / LLaMA integration
│   │   │
│   │   └── main.py                        # FastAPI entry point
│   │
│   ├── venv/
│   ├── .env                               # environment variables
│   └── .gitignore
│                           
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/                               # React frontend source code
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   └── README.md
│
├── .gitignore
└── README.md
```

---

## 🎯 Resume Bullets (for reference)

```
• Built async AI code review pipeline using FastAPI + Groq (LLaMA 3.3 70B, 128k context),
  analysing up to 10 files per repo with per-file bug detection, improvement suggestions,
  and code quality scoring

• Replaced naive /contents API with GitHub Git Tree API, reducing repo fetching from
  N recursive calls to 1 — enabling analysis of complex nested repos (40+ files)

• Implemented IP-based sliding window rate limiter and MySQL caching layer,
  eliminating redundant LLM calls for repeat repos and capping abuse at 5 req/hour

• Designed non-blocking job queue with async background processing and 2s frontend
  polling — preventing HTTP timeouts on large repos with 10–30s analysis time
```

---

## 📸 Screenshots

| Dashboard | Per-File Review |
|---|---|
| ![Dashboard](./screenshots/dashboard.png) | ![Review](./screenshots/review.png) |

---

## 🔜 Roadmap

- [ ] Code dependency graph — visual node graph of file imports
- [ ] GitHub webhook support — auto-review on every push
- [ ] Export review as PDF report
- [ ] Support for private repos (OAuth scope upgrade)

---

## 📄 License

MIT © 2025
