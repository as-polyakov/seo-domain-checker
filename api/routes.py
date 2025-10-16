"""
API routes for SEO Domain Checker
"""
from typing import List

from fastapi import APIRouter, HTTPException, status

import dao
from api.analysis_service import (
    create_analysis,
    get_analysis,
    list_analyses,
)
from api.models import (
    StartAnalysisRequest,
    AnalysisResponse,
    AnalysisListResponse, AnalysisResultsResponse, DomainAnalysisResult, RuleEvaluationResponse
)
from db.db import LinkDirection
from resources.disallowed_words import ForbiddenWordCategory

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
    "/analyses-results/{analysis_id}",
    response_model=AnalysisResultsResponse,
    summary="Get analysis by ID",
    description="Get details of a specific analysis session"
)
async def get_analysis_by_id(analysis_id: str) -> AnalysisResultsResponse:
    """
    Get analysis by ID
    
    - **analysis_id**: Unique identifier of the analysis
    
    Returns the analysis details including current status and progress.
    """
    try:
        analysis = get_analysis(analysis_id)
        rule_evaluations_per_domain = dao.get_rule_evaluations(analysis_id)
        domain_results: List[DomainAnalysisResult] = []
        for domain, rule_evaluations in rule_evaluations_per_domain.items():
            ld, lr = dao.get_in_out_num_domains(analysis_id, domain)
            domain_analysis_result = DomainAnalysisResult(
                domain=domain, rules_results={r.rule: RuleEvaluationResponse(
                    rule=r.rule, score=r.score, critical_violation=bool(r.critical_violation), details=r.details) for r in
                    rule_evaluations},
                dr=dao.get_domain_dr(analysis_id, domain),
                org_traffic=dao.get_domain_traffic_by_country(analysis_id, domain),
                org_traffic_history=dao.get_domain_traffic_by_date(analysis_id, domain),
                geography=dao.get_domain_traffic_by_country(analysis_id, domain),
                ld_lr_ratio=ld / lr if (ld and lr) else 0,
                top_page_traffic_pct=dao.get_domain_top_page_traffic_pcs(analysis_id, domain),
                backlinks_forbidden_words=len(dao.get_anchors_forbidden_words(analysis_id, domain, LinkDirection.IN,
                                                                              ForbiddenWordCategory.FORBIDDEN)),
                anchors_forbidden_words=len(dao.get_anchors_forbidden_words(analysis_id, domain, LinkDirection.OUT,
                                                                            ForbiddenWordCategory.FORBIDDEN)),
                anchors_spam_words=len(dao.get_anchors_forbidden_words(analysis_id, domain, LinkDirection.OUT,
                                                                       ForbiddenWordCategory.SPAM)),
                organic_keywords_forbidden_words=len(
                    dao.get_organic_keywords_forbidden_words(analysis_id, domain, ForbiddenWordCategory.FORBIDDEN)),
                organic_keywords_spam_words=len(
                    dao.get_organic_keywords_forbidden_words(analysis_id, domain, ForbiddenWordCategory.SPAM))
            )
            domain_results.append(domain_analysis_result)

        res = AnalysisResultsResponse(analysis=analysis, domain_results=domain_results)
        return res
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
