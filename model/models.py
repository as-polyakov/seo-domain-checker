"""
Data models for database entities
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List
from enum import Enum


class AnalysisStatus(str, Enum):
    """Analysis status enum"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class AnalysisDomain:
    domain: str
    price_usd: int
    notes: str

@dataclass
class Analysis:
    target_id: str                      # Primary key - unique analysis identifier
    name: str                           # Name of the analysis session
    status: AnalysisStatus              # Current status (pending, running, completed, failed)
    created_at: datetime                # Timestamp when analysis was created
    completed_at: Optional[datetime]    # Timestamp when analysis completed (None if not completed)
    domains: List[AnalysisDomain]
    processed_domains: int


@dataclass
class RuleEvaluation:
    """Result of a rule evaluation"""
    domain: str
    rule: str
    score: float  # Normalized score (0-1 typically)
    critical_violation: bool  # Whether this evaluation represents a critical violation
    details: str

@dataclass
class TargetQueryableDomain:
    domain:str
    lang: Optional[str] = None
    mode: str = "subdomains"
    protocol: str = "both"

    def __hash__(self):
        return hash((self.domain, self.mode, self.protocol))

    def __eq__(self, other):
        if not isinstance(other, TargetQueryableDomain):
            return False
        return (self.domain, self.mode, self.protocol) == \
            (other.domain, other.mode, other.protocol)
