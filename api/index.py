import sys
import os

# Ensure backend module can be imported in Vercel serverless environment
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class VercelPathRewriteMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        subpath = request.query_params.get("path")
        if subpath:
            clean = subpath.lstrip("/")
            request.scope["path"] = f"/api/{clean}"
        elif request.scope.get("path") in ["/api/index.py", "/index.py"]:
            request.scope["path"] = "/"
        return await call_next(request)

app.add_middleware(VercelPathRewriteMiddleware)
