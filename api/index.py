import sys
import os

# Ensure backend module can be imported in Vercel serverless environment
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app
from fastapi import Request

@app.api_route("/api/index.py", methods=["GET", "POST", "OPTIONS"])
@app.api_route("/index.py", methods=["GET", "POST", "OPTIONS"])
async def handle_vercel_index_debug(request: Request):
    return {
        "url_path": request.url.path,
        "scope_path": request.scope.get("path"),
        "headers": {k: v for k, v in request.headers.items() if "auth" not in k.lower()}
    }

