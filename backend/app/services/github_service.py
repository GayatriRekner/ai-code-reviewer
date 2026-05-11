import httpx
import base64
import os
from dotenv import load_dotenv

load_dotenv()

GITHUB_API = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")  # ← pulls from your .env

ALLOWED_EXTENSIONS = (".py", ".js", ".ts", ".java", ".cpp", ".jsx", ".tsx", ".go",".html",".css")
IGNORE_DIRS = {"node_modules", ".git", "dist", "build", "__pycache__", ".next", ".venv"}

MAX_FILES = 40
MAX_FILE_CHARS = 8000


def _get_headers():
    headers = {"Accept": "application/vnd.github+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


async def get_repo_files(owner: str, repo: str) -> list[dict]:
    """
    Uses Git Tree API — single request to get the ENTIRE repo file tree.
    Much faster and reliable vs recursive /contents calls.
    """
    url = f"{GITHUB_API}/repos/{owner}/{repo}/git/trees/HEAD?recursive=1"

    async with httpx.AsyncClient(timeout=20) as client:
        res = await client.get(url, headers=_get_headers())

        if res.status_code == 403:
            raise Exception("GitHub rate limit hit. Add a GITHUB_TOKEN in your .env")

        if res.status_code == 404:
            raise Exception(f"Repo '{owner}/{repo}' not found or is private.")

        if res.status_code != 200:
            raise Exception(f"GitHub API error: {res.status_code} — {res.text}")

        data = res.json()

    # Git Tree API returns a flat list of ALL files in the repo
    all_files = data.get("tree", [])

    # Check if tree was truncated (happens for repos > 100k files)
    if data.get("truncated"):
        print(f"[Warning] Repo tree truncated — only partial file list returned")

    collected = []

    for item in all_files:
        if len(collected) >= MAX_FILES:
            break

        # Only process blobs (files), skip trees (dirs)
        if item.get("type") != "blob":
            continue

        path: str = item.get("path", "")

        # Skip files inside ignored directories
        path_parts = set(path.split("/"))
        if path_parts & IGNORE_DIRS:  # set intersection — fast
            continue

        # Skip files without allowed extensions
        if not path.endswith(ALLOWED_EXTENSIONS):
            continue

        # Skip files over 1MB (GitHub won't return content for them anyway)
        if item.get("size", 0) > 1_000_000:
            continue

        collected.append({
            "name": path.split("/")[-1],
            "path": path,
            "sha": item.get("sha"),   # use sha for blob API if needed
        })

    return collected


async def get_file_content(owner: str, repo: str, path: str) -> str:
    """
    Fetch file content using /contents API (returns base64 encoded content).
    Falls back to raw download if file is too large for contents API.
    """
    url = f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}"

    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.get(url, headers=_get_headers())

        if res.status_code != 200:
            return ""

        data = res.json()

        # GitHub returns content as base64 — decode it properly
        raw_content = data.get("content", "")
        encoding = data.get("encoding", "")

        if not raw_content:
            # File too large for contents API — use download_url
            download_url = data.get("download_url")
            if download_url:
                raw_res = await client.get(download_url)
                content = raw_res.text
            else:
                return ""
        elif encoding == "base64":
            content = base64.b64decode(raw_content).decode("utf-8", errors="ignore")
        else:
            content = raw_content

    # Smart truncation — keep first 8000 chars but don't cut mid-line
    if len(content) > MAX_FILE_CHARS:
        truncated = content[:MAX_FILE_CHARS]
        last_newline = truncated.rfind("\n")
        content = truncated[:last_newline] + "\n\n# [File truncated for analysis]"

    return content