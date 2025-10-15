"""
Pydantic models for API requests and responses
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

# Import Analysis and AnalysisStatus from model layer
from model.models import Analysis, AnalysisStatus


class DomainInput(BaseModel):
    """Input model for a domain to be analyzed"""
    domain: str = Field(..., description="Domain name to analyze")
    price: Optional[str] = Field(None, description="Optional price information")
    notes: Optional[str] = Field(None, description="Optional notes about the domain")


class StartAnalysisRequest(BaseModel):
    """Request model for starting a new analysis"""
    name: str = Field(..., description="Name of the analysis session")
    domains: List[DomainInput] = Field(..., description="List of domains to analyze")


class AnalysisResponse(BaseModel):
    """Response model for analysis information"""
    id: str = Field(..., description="Unique analysis ID")
    name: str = Field(..., description="Name of the analysis session")
    status: AnalysisStatus = Field(..., description="Current status of the analysis")
    created_at: datetime = Field(..., description="Timestamp when analysis was created")
    completed_at: Optional[datetime] = Field(None, description="Timestamp when analysis was completed")
    total_domains: int = Field(..., description="Total number of domains to analyze")
    domains_analyzed: int = Field(0, description="Number of domains already analyzed")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class AnalysisListResponse(BaseModel):
    """Response model for list of analyses"""
    analyses: List[AnalysisResponse]


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")

