"""
FastAPI server for SEO Domain Checker API
"""
# Load config first to initialize environment variables
import config

import logging
import sys
import traceback

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import db.db
from api.routes import router
from fastapi import Request
from fastapi.responses import PlainTextResponse

# Configure logging to file
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

# Create FastAPI app
app = FastAPI(
    title="Verseo SEO Domain Checker API",
    description="API for analyzing and managing SEO domain evaluations",
    version="1.0.0",
    debug=True,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    print("🚀 Initializing database...")
    db.db.init_database()
    print("✅ Database initialized successfully")


@app.get("/", tags=["health"])
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Verseo SEO Domain Checker API",
        "version": "1.0.0"
    }


@app.get("/health", tags=["health"])
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.exception_handler(Exception)
async def all_exception_handler(request: Request, exc: Exception):
    sys.stderr.write("\n=== Exception caught by FastAPI ===\n")
    traceback.print_exc(file=sys.stderr)
    sys.stderr.write("=== End of traceback ===\n")
    return PlainTextResponse("Internal Server Error", status_code=500)

if __name__ == "__main__":
    import uvicorn

    db.db.init_database()
    logging.basicConfig(level=logging.DEBUG)
    logging.getLogger("uvicorn.error").setLevel(logging.DEBUG)
    logging.getLogger("uvicorn.access").setLevel(logging.DEBUG)
    logging.getLogger("uvicorn").setLevel(logging.DEBUG)
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")

