#!/usr/bin/env python
"""
Entry point for running the API server
"""
# Load config first to initialize environment variables
import config

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "api.server:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disabled to prevent killing background threads
        log_level="info"
    )

