"""
Service layer for analysis operations
"""
import threading
import uuid
from datetime import datetime
from typing import List

import dao
from api.models import StartAnalysisRequest, AnalysisResponse, AnalysisStatus
from extract.extract import DataExtractor
from model import Analysis
from model.models import AnalysisDomain
from rules.rule_aggregator import evaluate_domain
from utils import _safe_int


def create_analysis(request: StartAnalysisRequest) -> AnalysisResponse:
    """
    Create a new analysis session
    
    Args:
        request: StartAnalysisRequest containing analysis details
        
    Returns:
        AnalysisResponse with the created analysis information
    """
    analysis_id = str(uuid.uuid4())
    res = Analysis(analysis_id, request.name, AnalysisStatus.PENDING, datetime.now(), None,
                   [AnalysisDomain(d.domain, _safe_int(d.price), d.notes) for d in request.domains])
    dao.persist_analysis(res)

    analysis_data = {
        "id": analysis_id,
        "name": request.name,
        "status": AnalysisStatus.PENDING,
        "created_at": res.created_at,
        "completed_at": None,
        "total_domains": len(request.domains),
        "domains": [domain.dict() for domain in request.domains]
    }

    # Start analysis in background thread
    thread = threading.Thread(target=run_analysis, args=(res,))
    thread.daemon = True
    thread.start()

    return AnalysisResponse(**analysis_data)


#  select target_id,
#        name,
#        status,
#        created_at,
#        completed_at,
#        (select count(*) from analysis_domains where target_id = analysis.target_id) as "total_domains"
#         from analysis where target_id = ?
def get_analysis(analysis_id: str) -> AnalysisResponse:
    analysis = dao.get_analysis(analysis_id)
    return AnalysisResponse(id=analysis["target_id"], name=analysis["name"], status=AnalysisStatus(analysis["status"]),
                            created_at=dao.safe_date_from_str(analysis["created_at"]),
                            completed_at=dao.safe_date_from_str(analysis["completed_at"]),
                            total_domains=int(analysis["total_domains"]), domains_analyzed=0)


#         """
#         select target_id,
#        name,
#        status,
#        created_at,
#        completed_at,
#        (select count(*) from analysis_domains where target_id = analysis.target_id) as "total_domains"
#         from analysis
def list_analyses() -> List[AnalysisResponse]:
    return [AnalysisResponse(id=r["target_id"], name=r["name"], status=r["status"],
                             created_at=dao.safe_date_from_str(r["created_at"]),
                             completed_at=dao.safe_date_from_str(r["completed_at"]),
                             total_domains=r["total_domains"], domains_analyzed=0)
            for r in dao.get_recent_analysis()]


def run_analysis(analysis: Analysis):
    dao.update_analysis_status(analysis.target_id, AnalysisStatus.RUNNING)
    data_extractor = DataExtractor()
    data_extractor.run_extract(analysis)
    eval_results = [evaluate_domain(analysis.target_id, domain.domain)
                    for domain in analysis.domains]

    dao.persist_rule_evaluations(analysis.target_id, eval_results)
    dao.update_analysis_status(analysis.target_id, AnalysisStatus.COMPLETED)
    print(f"Analysis {analysis.target_id} completed successfully")
