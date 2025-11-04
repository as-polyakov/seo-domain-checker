"""
Service layer for analysis operations
"""
import logging
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

# Configure logging
logger = logging.getLogger(__name__)


def create_analysis(request: StartAnalysisRequest) -> AnalysisResponse:
    analysis_id = str(uuid.uuid4())
    logger.info(f"🆕 Creating new analysis: id={analysis_id}, name='{request.name}'")
    
    res = Analysis(analysis_id, request.name, AnalysisStatus.PENDING, datetime.now(), None,
                   [AnalysisDomain(d.domain, _safe_int(d.price), d.notes) for d in request.domains], 0)
    
    logger.info(f"💾 Persisting analysis to database...")
    dao.persist_analysis(res)
    logger.info(f"✅ Analysis persisted successfully")

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
    logger.info(f"🔄 Starting background processing thread for analysis {analysis_id}")
    thread = threading.Thread(target=run_analysis, args=(res,))
    thread.daemon = True
    thread.start()
    logger.info(f"✅ Background thread started")

    return AnalysisResponse(**analysis_data)


#  select target_id,
#        name,
#        status,
#        created_at,
#        completed_at,
#        (select count(*) from analysis_domains where target_id = analysis.target_id) as "total_domains"
#         from analysis where target_id = ?
def to_analysis_response(analysis: Analysis) -> AnalysisResponse:
    return AnalysisResponse(id=analysis.target_id, name=analysis.name, status=AnalysisStatus(analysis.status),
                            created_at=analysis.created_at,
                            completed_at=analysis.completed_at,
                            total_domains=len(analysis.domains), domains_analyzed=analysis.processed_domains)


def list_analyses() -> List[AnalysisResponse]:
    return [AnalysisResponse(id=r["target_id"], name=r["name"], status=r["status"],
                             created_at=dao.safe_date_from_str(r["created_at"]),
                             completed_at=dao.safe_date_from_str(r["completed_at"]),
                             total_domains=r["total_domains"], domains_analyzed=r["processed_domains"])
            for r in dao.get_recent_analysis()]


def run_analysis(analysis: Analysis):
    logger.info(f"🚀 BACKGROUND THREAD: Starting analysis {analysis.target_id}")
    logger.info(f"   Analysis name: {analysis.name}")
    logger.info(f"   Total domains: {len(analysis.domains)}")
    
    try:
        logger.info(f"📝 Updating status to RUNNING...")
        dao.update_analysis_status(analysis.target_id, AnalysisStatus.RUNNING)
        logger.info(f"✅ Status updated to RUNNING")
        
        logger.info(f"🔍 Initializing DataExtractor...")
        data_extractor = DataExtractor()
        logger.info(f"✅ DataExtractor initialized")
        
        logger.info(f"📊 Starting data extraction for {len(analysis.domains)} domains...")
        data_extractor.run_extract(analysis)
        logger.info(f"✅ Data extraction completed")
        
        logger.info(f"📏 Evaluating rules for all domains...")
        eval_results = [evaluate_domain(analysis.target_id, domain.domain)
                        for domain in analysis.domains]
        logger.info(f"✅ Rule evaluation completed for all domains")

        logger.info(f"💾 Persisting rule evaluation results...")
        dao.persist_rule_evaluations(analysis.target_id, eval_results)
        logger.info(f"✅ Rule results persisted")
        
        logger.info(f"📝 Updating status to COMPLETED...")
        dao.update_analysis_status(analysis.target_id, AnalysisStatus.COMPLETED)
        logger.info(f"🎉 Analysis {analysis.target_id} completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ ERROR in analysis {analysis.target_id}: {str(e)}")
        logger.error(f"   Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"   Traceback:\n{traceback.format_exc()}")
        dao.update_analysis_status(analysis.target_id, AnalysisStatus.FAILED)
        logger.error(f"   Status updated to FAILED")
