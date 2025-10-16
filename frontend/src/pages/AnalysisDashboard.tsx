import { useState } from "react";
import { Plus, PlayCircle, Loader2, Clock, CheckCheck, XCircle, Eye, X } from "lucide-react";
import { Badge, Button, Input } from "../components/UIComponents";
import { Analysis, AnalysisStatus, DomainInput } from "../types";

// ===== New Analysis Modal =====
function NewAnalysisModal({ open, onClose, onSubmit }: any) {
  const [analysisName, setAnalysisName] = useState("");
  const [domains, setDomains] = useState<DomainInput[]>([]);

  const addDomain = () => {
    const newId = String(Date.now());
    setDomains([...domains, { id: newId, domain: "", price: "", notes: "" }]);
  };

  const updateDomain = (id: string, field: keyof DomainInput, value: string) => {
    setDomains(domains.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleSubmit = () => {
    if (!analysisName.trim()) {
      alert("Please enter analysis name");
      return;
    }
    if (domains.length === 0 || domains.some(d => !d.domain.trim())) {
      alert("Please add at least one domain");
      return;
    }
    onSubmit({ name: analysisName, domains });
    setAnalysisName("");
    setDomains([]);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold">New Analysis Session</h2>
          <Button variant="secondary" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Analysis Name</label>
            <Input
              placeholder="e.g., Q1 2025 Domain Batch"
              value={analysisName}
              onChange={(e: any) => setAnalysisName(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Domains to Analyze</label>
              <Button size="sm" onClick={addDomain}><Plus className="h-4 w-4" />Add Domain</Button>
            </div>

            {domains.length === 0 ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-500">
                <p className="mb-2">No domains added yet</p>
                <Button size="sm" variant="outline" onClick={addDomain}><Plus className="h-4 w-4" />Add First Domain</Button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">#</th>
                      <th className="text-left py-2 px-3 font-medium">Domain</th>
                      <th className="text-left py-2 px-3 font-medium">Price (optional)</th>
                      <th className="text-left py-2 px-3 font-medium">Notes (optional)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domains.map((d, idx) => (
                      <tr key={d.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <Input
                            placeholder="example.com"
                            value={d.domain}
                            onChange={(e: any) => updateDomain(d.id, 'domain', e.target.value)}
                            className="text-sm"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <Input
                            placeholder="$250"
                            value={d.price || ""}
                            onChange={(e: any) => updateDomain(d.id, 'price', e.target.value)}
                            className="text-sm"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <Input
                            placeholder="Additional context..."
                            value={d.notes || ""}
                            onChange={(e: any) => updateDomain(d.id, 'notes', e.target.value)}
                            className="text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={domains.length === 0}>
            <PlayCircle className="h-4 w-4" />Start Analysis ({domains.length} {domains.length === 1 ? 'domain' : 'domains'})
          </Button>
        </div>
      </div>
    </div>
  );
}

// ===== Analysis Dashboard =====
export default function AnalysisDashboard({ analyses, onNewAnalysis, onSelectAnalysis, isLoading }: {
  analyses: Analysis[];
  onNewAnalysis: (data: { name: string; domains: DomainInput[] }) => void;
  onSelectAnalysis: (id: string) => void;
  isLoading: boolean;
}) {
  const [showNewModal, setShowNewModal] = useState(false);

  const getStatusIcon = (status: AnalysisStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'running': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed': return <CheckCheck className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: AnalysisStatus) => {
    const toneMap = { pending: 'slate', running: 'blue', completed: 'emerald', failed: 'rose' };
    return <Badge tone={toneMap[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const cls = (...a: any[]) => a.filter(Boolean).join(" ");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analysis Dashboard</h1>
            <p className="text-slate-600">Manage and review your domain analysis sessions</p>
          </div>
          <Button onClick={() => setShowNewModal(true)}>
            <Plus className="h-4 w-4" />New Analysis
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500 mb-1">Total Analyses</div>
            <div className="text-2xl font-bold">{analyses.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500 mb-1">Running</div>
            <div className="text-2xl font-bold text-blue-600">{analyses.filter((a: Analysis) => a.status === 'running').length}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500 mb-1">Completed</div>
            <div className="text-2xl font-bold text-emerald-600">{analyses.filter((a: Analysis) => a.status === 'completed').length}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500 mb-1">Total Domains</div>
            <div className="text-2xl font-bold">{analyses.reduce((sum: number, a: Analysis) => sum + a.totalDomains, 0)}</div>
          </div>
        </div>

        {/* Analysis List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold">Analysis Sessions</h2>
          </div>
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-indigo-600" />
              <p className="text-slate-600">Loading analyses...</p>
            </div>
          ) : analyses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-slate-400 mb-4">
                <PlayCircle className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-700 mb-2">No analysis sessions yet</p>
                <p className="text-sm">Start your first analysis to begin evaluating domains</p>
              </div>
              <Button onClick={() => setShowNewModal(true)} className="mt-4">
                <Plus className="h-4 w-4" />Create First Analysis
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-sm">Name</th>
                  <th className="text-left py-3 px-6 font-medium text-sm">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-sm">Progress</th>
                  <th className="text-left py-3 px-6 font-medium text-sm">Created</th>
                  <th className="text-left py-3 px-6 font-medium text-sm">Completed</th>
                  <th className="text-right py-3 px-6 font-medium text-sm">View</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((analysis: Analysis) => (
                  <tr
                    key={analysis.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer"
                    onDoubleClick={() => analysis.status === 'completed' && onSelectAnalysis(analysis.id)}
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{analysis.name}</div>
                      <div className="text-xs text-slate-500">{analysis.totalDomains} {analysis.totalDomains === 1 ? 'domain' : 'domains'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(analysis.status)}
                        {getStatusBadge(analysis.status)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-xs">
                          <div
                            className={cls("h-2 rounded-full", analysis.status === 'completed' ? 'bg-emerald-500' : analysis.status === 'running' ? 'bg-blue-500' : 'bg-slate-400')}
                            style={{ width: `${(analysis.domainsAnalyzed / analysis.totalDomains) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600 tabular-nums">{analysis.domainsAnalyzed}/{analysis.totalDomains}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">{formatDate(analysis.createdAt)}</td>
                    <td className="py-4 px-6 text-sm text-slate-600">{analysis.completedAt ? formatDate(analysis.completedAt) : '—'}</td>
                    <td className="py-4 px-6 text-right">
                      {analysis.status === 'completed' && (
                        <Button size="sm" variant="outline" onClick={() => onSelectAnalysis(analysis.id)}>
                          <Eye className="h-4 w-4" />View Results
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <NewAnalysisModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSubmit={onNewAnalysis}
      />
    </div>
  );
}

