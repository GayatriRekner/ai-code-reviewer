import httpx
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

MAX_CODE_CHARS = 20000  # safe limit for mixtral-8x7b-32768

async def review_code(code: str):
    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    # ✅ Truncate if too large
    if len(code) > MAX_CODE_CHARS:
        code = code[:MAX_CODE_CHARS] + "\n\n# [Remaining files truncated]"

    prompt = f"""
You are a senior software engineer performing a code review.

Analyze the following code and return ONLY a valid JSON object.

STRICT RULES:
- Output must be ONLY JSON
- Do NOT include code blocks
- Do NOT include explanations
- Do NOT include examples
- Do NOT return placeholder text like "point 1"
- Every list must contain REAL meaningful points based on the code
- If no issues found, return empty lists []

FORMAT:
{{
  "bugs": ["..."],
  "improvements": ["..."],
  "code_quality": ["..."]
}}

Code:
{code}
"""

    data = {
        "model": "llama-3.3-70b-versatile",   # 
        "max_tokens": 2048,               # ✅ enough for detailed review
        "temperature": 0,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
async def review_file(filename: str, content: str) -> dict:
    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    if len(content) > MAX_CODE_CHARS:
        content = content[:MAX_CODE_CHARS] + "\n\n# [File truncated]"

    prompt = f"""
You are a senior software engineer reviewing a single file.

File: {filename}

Analyze this file and return ONLY a valid JSON object.

STRICT RULES:
- Output ONLY JSON, no explanations, no code blocks
- Be specific to THIS file only
- If no issues found, return empty lists []

FORMAT:
{{
  "bugs": ["specific bug in this file..."],
  "improvements": ["specific improvement for this file..."],
  "code_quality": ["specific quality note for this file..."]
}}

Code:
{content}
"""

    data = {
        "model": "llama-3.3-70b-versatile",
        "max_tokens": 1024,
        "temperature": 0,
        "messages": [{"role": "user", "content": prompt}]
    }

    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(url, headers=headers, json=data)
        res_json = res.json()

        try:
            content_raw = res_json["choices"][0]["message"]["content"]
            content_raw = re.sub(r"```.*?\n", "", content_raw).replace("```", "")
            matches = re.findall(r"\{.*?\}", content_raw, re.DOTALL)

            for match in matches:
                try:
                    parsed = json.loads(match)
                    if all(k in parsed for k in ["bugs", "improvements", "code_quality"]):
                        return parsed
                except:
                    continue
        except:
            pass

    return {"bugs": [], "improvements": [], "code_quality": []}

   