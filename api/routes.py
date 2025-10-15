"""
API routes for SEO Domain Checker
"""
from fastapi import APIRouter, HTTPException, status

from api.analysis_service import (
    create_analysis,
    get_analysis,
    list_analyses,
)
from api.models import (
    StartAnalysisRequest,
    AnalysisResponse,
    AnalysisListResponse
)

router = APIRouter(prefix="/api", tags=["analysis"])


@router.post(
    "/startAnalysis",
    response_model=AnalysisResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start a new analysis",
    description="Create and start a new domain analysis session"
)
async def start_analysis(request: StartAnalysisRequest):
    """
    Start a new analysis session
    
    - **name**: Name for the analysis session (e.g., "Q1 2025 Domain Batch")
    - **domains**: List of domains with optional price and notes
    
    Returns the created analysis with a unique ID and pending status.
    The analysis will be processed in the background.
    """
    try:
        if not request.name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Analysis name is required"
            )
        
        if not request.domains or len(request.domains) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one domain is required"
            )
        
        for domain in request.domains:
            if not domain.domain.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="All domains must have a valid domain name"
                )
        
        analysis = create_analysis(request)
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create analysis: {str(e)}"
        )


@router.get(
    "/analyses",
    response_model=AnalysisListResponse,
    summary="List all analyses",
    description="Get a list of all analysis sessions"
)
async def get_analyses():
    """
    Get all analyses
    
    Returns a list of all analysis sessions with their current status.
    """
    try:
        analyses = list_analyses()
        return AnalysisListResponse(analyses=analyses)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve analyses: {str(e)}"
        )


@router.get(
    "/analyses/{analysis_id}",
    response_model=AnalysisResponse,
    summary="Get analysis by ID",
    description="Get details of a specific analysis session"
)
async def get_analysis_by_id(analysis_id: str):
    """
    Get analysis by ID
    
    - **analysis_id**: Unique identifier of the analysis
    
    Returns the analysis details including current status and progress.
    """
    try:
        analysis = get_analysis(analysis_id)
        return analysis
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis {analysis_id} not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve analysis: {str(e)}"
        )


