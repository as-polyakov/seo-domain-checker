# API Integration Guide

## Overview

The backend now has a REST API built with FastAPI that the frontend uses to manage analysis sessions.

## What Was Added

### Backend (Python)

1. **New Dependencies** (added to `requirements.txt`):
   - `fastapi==0.115.0` - Modern web framework
   - `uvicorn==0.32.0` - ASGI server
   - `pydantic==2.9.0` - Data validation

2. **New API Module** (`api/`):
   - `models.py` - Request/response data models
   - `routes.py` - API endpoint definitions
   - `server.py` - FastAPI application setup with CORS
   - `analysis_service.py` - Business logic for analysis operations
   - `README.md` - API documentation

3. **API Server Entry Point** (`api_server.py`):
   - Script to run the API server with auto-reload

4. **Updated Startup Scripts**:
   - `start-dev.sh` - Now starts API server instead of main.py
   - `start-dev.bat` - Windows version

### Frontend (React)

1. **Updated Analysis Creation** (`frontend/src/App.tsx`):
   - Now calls backend API instead of using mock data
   - Polls for status updates every second
   - Handles API errors gracefully

## API Endpoints

### POST /api/startAnalysis

Create and start a new domain analysis.

**Request:**
```json
{
  "name": "Q1 2025 Domain Batch",
  "domains": [
    {
      "domain": "example.com",
      "price": "$250",
      "notes": "Optional notes"
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "name": "Q1 2025 Domain Batch",
  "status": "pending",
  "created_at": "2025-01-15T10:30:00",
  "completed_at": null,
  "total_domains": 1,
  "domains_analyzed": 0
}
```

### GET /api/analyses

List all analysis sessions.

### GET /api/analyses/{analysis_id}

Get status of a specific analysis.

### DELETE /api/analyses/{analysis_id}

Delete an analysis session.

## How It Works

### 1. Creating New Analysis

```
User fills form → Frontend calls API → Backend creates analysis → Background thread starts
                                      ↓
                                   Returns analysis ID and status
```

### 2. Status Updates

```
Frontend polls every 1s → GET /api/analyses/{id} → Backend returns current status
                                                   ↓
                                            Updates UI (pending → running → completed)
```

### 3. Background Processing

The backend runs analysis in a separate thread:
```python
# api/analysis_service.py
def run_analysis(analysis_id: str):
    # Update status to 'running'
    # Process each domain
    # Update progress
    # Mark as 'completed' or 'failed'
```

## Current Implementation

### ✅ Implemented

- REST API with FastAPI
- CORS configuration for frontend
- Analysis creation endpoint
- Status polling
- Background processing simulation
- In-memory storage
- Error handling

### 🚧 TODO - Integration Points

The actual domain analysis logic needs to be integrated:

1. **Replace simulation in `api/analysis_service.py`**:
   ```python
   def run_analysis(analysis_id: str):
       # TODO: Replace this with actual analysis
       # Import from main.py:
       # - AhrefsClient
       # - SimilarWebClient
       # - Database operations
       
       # Current: Simulates with time.sleep()
       # Needed: Call actual API and store results
   ```

2. **Add database persistence**:
   - Store analyses in SQLite
   - Store domain results
   - Query for analysis history

3. **Return actual domain results**:
   - Add endpoint to get domain data for completed analysis
   - Frontend currently generates mock results

## Setup Instructions

### 1. Install New Dependencies

```bash
# From project root
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 2. Start the API Server

**Option A: Use startup script (recommended)**
```bash
./start-dev.sh  # or start-dev.bat on Windows
```

**Option B: Start manually**
```bash
# Terminal 1 - Backend
source venv/bin/activate
python api_server.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Test the API

Visit http://localhost:8000/docs for interactive API documentation.

## Testing the Integration

1. **Start both servers** (backend on :8000, frontend on :3000)

2. **Create analysis** via UI:
   - Click "New Analysis"
   - Enter name: "Test Integration"
   - Add domain: "example.com"
   - Click "Start Analysis"

3. **Watch the flow**:
   - Check browser console for API calls
   - Status should change: pending → running → completed
   - Progress bar should update
   - After ~3 seconds, analysis completes

4. **Check backend logs**:
   ```
   INFO:     127.0.0.1:12345 - "POST /api/startAnalysis HTTP/1.1" 201
   Analysis abc-123 completed successfully
   INFO:     127.0.0.1:12346 - "GET /api/analyses/abc-123 HTTP/1.1" 200
   ```

## Troubleshooting

### CORS Errors

If you see CORS errors in browser console:
- Check that backend is running on port 8000
- Verify `allow_origins` in `api/server.py` includes your frontend URL

### Connection Refused

If frontend can't connect to backend:
- Ensure API server is running: http://localhost:8000/health
- Check firewall settings
- Try http://localhost:8000/docs to access API docs

### Import Errors

If Python import errors occur:
```bash
# Make sure you're in the project root
cd /Users/apolyakov/dev/seo-domain-checker

# Activate virtual environment
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

## Next Steps

To complete the integration:

1. **Connect to actual analysis pipeline**:
   - Modify `api/analysis_service.py:run_analysis()`
   - Import and use functions from `main.py`
   - Call Ahrefs API, SimilarWeb API, etc.
   - Store results in database

2. **Add results endpoint**:
   ```python
   @router.get("/api/analyses/{analysis_id}/results")
   async def get_analysis_results(analysis_id: str):
       # Return domain analysis results from database
   ```

3. **Update frontend**:
   - Fetch real results from backend
   - Remove mock result generation

4. **Add database persistence**:
   - Store analyses in `analyses` table
   - Link to domain results
   - Update DAO layer

5. **Add authentication**:
   - User login/registration
   - Analysis ownership
   - API key management

## API Documentation

Once the server is running, comprehensive API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These provide:
- Interactive API testing
- Request/response schemas
- Example payloads
- Error responses

