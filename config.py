"""
Configuration module - loads environment variables from .env file
This should be imported first in any entry point
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Export environment variables for easy access
AHREFS_API_TOKEN = os.environ.get("AHREFS_API_TOKEN")
SIMILAR_WEB_KEY = os.environ.get("SIMILAR_WEB_KEY")

# Validate critical environment variables
if not AHREFS_API_TOKEN:
    print("⚠️  WARNING: AHREFS_API_TOKEN not set in .env file")

