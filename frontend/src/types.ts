// ===== TYPES =====
export type AnalysisStatus = 'pending' | 'running' | 'completed' | 'failed';
export type DomainStatus = 'OK' | 'Review' | 'Reject';

export interface DomainInput {
  id: string;
  domain: string;
  price?: string;
  notes?: string;
}

export interface Analysis {
  id: string;
  name: string;
  status: AnalysisStatus;
  createdAt: Date;
  completedAt?: Date;
  totalDomains: number;
  domainsAnalyzed: number;
  domains?: DomainData[];
}

export interface DomainData {
  id: string;
  domain: string;
  price: string;
  scores: { 
    overall: number; 
    DomainRatingRule: number; 
    OrganicTrafficRule: number;
    HistoricalOrganicTrafficRule: number;
    GeographyRule: number;
    DomainsInOutLinksRatioRule: number;
    SingleTopPageTrafficRule: number;
    ForbiddenWordsBacklinksRule: number;
    SpamWordsAnchorsRule: number;
    ForbiddenWordsAnchorRule: number;
    ForbiddenWordsOrganicKeywordsRule: number;
    SpamWordsOrganicKeywordsRule: number;
  };
  dr: number;
  org_traffic: { [country: string]: number };
  org_traffic_history: { [date: string]: number };
  geography: { [country: string]: number };
  ld_lr_ratio: number;
  top_page_traffic_pct: number;
  backlinks_forbidden_words: number;
  anchors_forbidden_words: number;
  anchors_spam_words: number;
  organic_keywords_forbidden_words: number;
  organic_keywords_spam_words: number;
  status: DomainStatus;
  criticalViolations?: string[]; // Rules that triggered rejection
}


