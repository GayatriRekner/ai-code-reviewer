from collections import defaultdict
from datetime import datetime, timedelta

request_log = defaultdict(list)

MAX_REQUESTS = 10
WINDOW_MINUTES = 60


def is_rate_limited(ip: str) -> bool:
    now = datetime.utcnow()
    window_start = now - timedelta(minutes=WINDOW_MINUTES)

    request_log[ip] = [t for t in request_log[ip] if t > window_start]

    if len(request_log[ip]) >= MAX_REQUESTS:
        return True

    request_log[ip].append(now)
    return False


def get_remaining(ip: str) -> int:
    now = datetime.utcnow()
    window_start = now - timedelta(minutes=WINDOW_MINUTES)
    recent = [t for t in request_log[ip] if t > window_start]
    return max(0, MAX_REQUESTS - len(recent))