import { useEffect, useState } from "react";
import AnalysisDashboard from "./pages/AnalysisDashboard";
import AnalysisResults from "./pages/AnalysisResults";
import { Analysis, AnalysisStatus, DomainData, DomainInput } from "./types";

// ===== Main App with Navigation =====
export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'results'>('dashboard');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisResults, setAnalysisResults] = useState<DomainData[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  // Fetch analyses from API only when on dashboard view
  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchAnalyses();
      
      // Refresh analyses every 2 seconds to see status updates
      const refreshInterval = setInterval(fetchAnalyses, 2000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [currentView]);

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/analyses');
      if (response.ok) {
        const data = await response.json();
        
        // Convert API response to frontend format
        const analysesData: Analysis[] = data.analyses.map((a: any) => ({
          id: a.id,
          name: a.name,
          status: a.status as AnalysisStatus,
          createdAt: new Date(a.created_at),
          completedAt: a.completed_at ? new Date(a.completed_at) : undefined,
          totalDomains: a.total_domains,
          domainsAnalyzed: a.domains_analyzed || 0,
        }));
        
        setAnalyses(analysesData);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
      setIsLoading(false);
    }
  };

  const fetchAnalysisResults = async (analysisId: string) => {
    setIsLoadingResults(true);
    try {
      const response = await fetch(`http://localhost:8000/api/analyses-results/${analysisId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Transform API response to DomainData format
        const domainResults: DomainData[] = data.domain_results.map((dr: any, index: number) => {
          // Extract scores from rules_results (convert 0-1 scale to 0-100)
          const scores = {
            overall: Math.round((dr.rules_results.overall?.score || 0) * 100),
            DomainRatingRule: Math.round((dr.rules_results.DomainRatingRule?.score || 0) * 100),
            OrganicTrafficRule: Math.round((dr.rules_results.OrganicTrafficRule?.score || 0) * 100),
            HistoricalOrganicTrafficRule: Math.round((dr.rules_results.HistoricalOrganicTrafficRule?.score || 0) * 100),
            GeographyRule: Math.round((dr.rules_results.GeographyRule?.score || 0) * 100),
            DomainsInOutLinksRatioRule: Math.round((dr.rules_results.DomainsInOutLinksRatioRule?.score || 0) * 100),
            SingleTopPageTrafficRule: Math.round((dr.rules_results.SingleTopPageTrafficRule?.score || 0) * 100),
            ForbiddenWordsBacklinksRule: Math.round((dr.rules_results.ForbiddenWordsBacklinksRule?.score || 0) * 100),
            SpamWordsAnchorsRule: Math.round((dr.rules_results.SpamWordsAnchorsRule?.score || 0) * 100),
            ForbiddenWordsAnchorRule: Math.round((dr.rules_results.ForbiddenWordsAnchorRule?.score || 0) * 100),
            ForbiddenWordsOrganicKeywordsRule: Math.round((dr.rules_results.ForbiddenWordsOrganicKeywordsRule?.score || 0) * 100),
            SpamWordsOrganicKeywordsRule: Math.round((dr.rules_results.SpamWordsOrganicKeywordsRule?.score || 0) * 100),
          };

          // Determine status based on critical violations
          const hasCriticalViolation = dr.rules_results.overall.critical_violation;
          const status = hasCriticalViolation ? "Reject" : (scores.overall > 60 ? "OK" : "Review");
          return {
            id: String(index + 1),
            domain: dr.domain,
            price: "N/A", // Price not in API response
            scores,
            dr: dr.dr,
            org_traffic: dr.org_traffic,
            org_traffic_history: dr.org_traffic_history,
            geography: dr.geography,
            ld_lr_ratio: dr.ld_lr_ratio,
            top_page_traffic_pct: dr.top_page_traffic_pct,
            backlinks_forbidden_words: dr.backlinks_forbidden_words,
            anchors_forbidden_words: dr.anchors_forbidden_words,
            anchors_spam_words: dr.anchors_spam_words,
            organic_keywords_forbidden_words: dr.organic_keywords_forbidden_words,
            organic_keywords_spam_words: dr.organic_keywords_spam_words,
            status,
          };
        });

        setAnalysisResults(domainResults);
        setIsLoadingResults(false);
      }
    } catch (error) {
      console.error('Error fetching analysis results:', error);
      setIsLoadingResults(false);
    }
  };

  const handleNewAnalysis = async (data: { name: string; domains: DomainInput[] }) => {
    try {
      // Call the backend API
      const response = await fetch('http://localhost:8000/api/startAnalysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          domains: data.domains,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      // Analysis created successfully - refresh the analyses list
      await fetchAnalyses();
      
      // Note: The periodic refresh (every 2 seconds) will automatically
      // update the status as the analysis progresses
      
    } catch (error) {
      console.error('Error creating analysis:', error);
      alert('Failed to create analysis. Please make sure the backend server is running.');
    }
  };

  const handleSelectAnalysis = async (id: string) => {
    setSelectedAnalysisId(id);
    setCurrentView('results');
    // Fetch the analysis results
    await fetchAnalysisResults(id);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedAnalysisId(null);
    setAnalysisResults([]); // Clear results when going back
  };

  const selectedAnalysis = analyses.find(a => a.id === selectedAnalysisId);

  if (currentView === 'results' && selectedAnalysis) {
    // Use fetched analysis results or show loading state
    if (isLoadingResults) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-medium text-slate-700">Loading analysis results...</div>
          </div>
        </div>
      );
    }

    // Use fetched results or show empty state
    const domainsToShow = analysisResults;
    
    return (
      <AnalysisResults
        analysisId={selectedAnalysis.id}
        onBack={handleBackToDashboard}
        DOMAINS={domainsToShow}
      />
    );
  }

  return (
    <AnalysisDashboard
      analyses={analyses}
      onNewAnalysis={handleNewAnalysis}
      onSelectAnalysis={handleSelectAnalysis}
      isLoading={isLoading}
    />
  );
}
