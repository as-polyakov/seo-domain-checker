import React, { useEffect, useMemo, useRef, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { CheckCircle2, XCircle, AlertTriangle, ChevronRight, ChevronDown, Download, Upload, Sun, Moon, Search, Eye, X, Filter, Keyboard, ChevronDown as Caret, Plus, PlayCircle, ArrowLeft, Loader2, Clock, CheckCheck } from "lucide-react";

// ===== TYPES =====
type AnalysisStatus = 'pending' | 'running' | 'completed' | 'failed';
type DomainStatus = 'OK' | 'Review' | 'Reject';

interface DomainInput {
  id: string;
  domain: string;
  price?: string;
  notes?: string;
}

interface Analysis {
  id: string;
  name: string;
  status: AnalysisStatus;
  createdAt: Date;
  completedAt?: Date;
  totalDomains: number;
  domainsAnalyzed: number;
  domains?: DomainData[];
}

interface DomainData {
  id: string;
  domain: string;
  country: string;
  language: string;
  topic: string;
  status: DomainStatus;
  scores: { total: number; safety: number; authority: number; relevance: number; commercial: number };
  trafficHistory: number[];
  price: string;
  dr: number;
  orgTraffic: number;
  ldRdPct: number;
  topPage: { url: string; title: string };
  forbiddenOutgoingPct: string;
  spamOutgoingPct: string;
  preview: any;
}

// ===== UI helpers (Tailwind) =====
const cls = (...a:any[]) => a.filter(Boolean).join(" ");
const Badge = ({ children, tone = "slate" }: any) => (
  <span className={cls(
    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
    tone === "emerald" && "bg-emerald-100 text-emerald-800",
    tone === "amber" && "bg-amber-100 text-amber-800",
    tone === "rose" && "bg-rose-100 text-rose-800",
    tone === "blue" && "bg-blue-100 text-blue-800",
    tone === "slate" && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
  )}>{children}</span>
);
const Button = ({ children, onClick, variant = "default", size = "md", className, disabled }: any) => (
  <button onClick={onClick} disabled={disabled} className={cls(
    "inline-flex items-center gap-2 rounded-md border transition active:translate-y-px whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed",
    size === "sm" ? "px-2 py-1 text-sm" : "px-3 py-2",
    variant === "default" && "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500",
    variant === "secondary" && "bg-white text-slate-800 border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700",
    variant === "destructive" && "bg-rose-600 text-white border-rose-600 hover:bg-rose-500",
    variant === "outline" && "bg-transparent text-slate-800 border-slate-300 hover:bg-slate-50 dark:text-slate-200 dark:border-slate-700",
    className
  )}>{children}</button>
);
const Input = (props: any) => <input {...props} className={cls("w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700", props.className)} />;
const Checkbox = ({ checked, onChange }: any) => (
  <input type="checkbox" checked={checked} onChange={(e)=>onChange(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
);

// ===== visuals =====
const dotClass = (n:number, invert=false) => {
  const v = Number(n);
  if (Number.isNaN(v)) return "bg-slate-300";
  const good = invert ? v < 15 : v >= 85;
  const warn = invert ? v < 35 : v >= 70;
  return good ? "bg-emerald-500" : warn ? "bg-amber-500" : "bg-rose-500";
};
function MetricCell({ value, invert=false }:{value:number, invert?:boolean}){
  return (
    <div className="flex items-center justify-end gap-2 tabular-nums">
      <span className={cls("h-2.5 w-2.5 rounded-full", dotClass(value, invert))}></span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
const Sparkline = ({ data }: any) => (
  <div className="h-8 w-28">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data.map((v:number, i:number) => ({ i, v }))} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <Line type="monotone" dataKey="v" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// ===== logo (planet) =====
const VerseoLogo = ({ size = 24 }:any) => (
  <div className="flex items-center gap-2 select-none">
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="18" className="stroke-indigo-600" strokeWidth="2" fill="none"/>
      <path d="M8 32c10-8 38-8 48 0" className="stroke-indigo-400" strokeWidth="2" fill="none"/>
      <path d="M16 20c8 6 24 6 32 0" className="stroke-indigo-300" strokeWidth="2" fill="none"/>
      <path d="M16 44c8-6 24-6 32 0" className="stroke-indigo-300" strokeWidth="2" fill="none"/>
      <circle cx="18" cy="26" r="2" className="fill-emerald-400" />
      <circle cx="46" cy="26" r="2" className="fill-amber-400" />
      <circle cx="32" cy="38" r="2" className="fill-rose-400" />
    </svg>
    <span className="font-bold tracking-tight text-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-transparent bg-clip-text">Verseo</span>
  </div>
);

// ===== helpers =====
const rand = (min:number, max:number) => Math.floor(Math.random() * (max - min + 1)) + min;
const priceNum = (p:string) => Number(String(p).replace(/[^0-9.]/g, "")) || 0;

// ===== mock data =====
const makeAnchors = (n:number) => Array.from({ length: n }).map((_, i) => ({
  anchor: ["project tracker","marketing tips","home insurance","travel deals","crm tutorial","email marketing"][i % 6],
  url: `https://domain${(i%10)+1}.com/post-${i+1}`,
  rel: ["dofollow","nofollow"][i % 2],
}));
const makeKeywords = (n:number) => Array.from({ length: n }).map((_, i) => ({
  kw: ["crm software","marketing analytics","supply chain","home security","cloud backup","fitness programs"][i % 6],
  pos: rand(1, 50),
}));

const MOCK_DOMAINS: DomainData[] = Array.from({ length: 16 }).map((_, i) => {
  const topics = ["Business", "Tech", "Finance", "News", "E-commerce", "Travel", "Education", "Health", "SaaS", "Entertainment"];
  const total = rand(30, 99);
  const safety = rand(20, 99);
  const authority = rand(20, 99);
  const relevance = rand(20, 99);
  const commercial = rand(20, 99);
  const dr = rand(10, 90);
  const orgTraffic = rand(1500, 400000);
  const ldRdPct = Number((Math.random()*5).toFixed(2));
  const status: DomainStatus = total > 90 ? "OK" : (total > 60 ? "Review" : "Reject");
  return {
    id: String(i + 1),
    domain: `domain${i + 1}.com`,
    country: ["US", "DE", "FR", "ES", "IT", "PL", "UK", "CA", "AU", "JP", "SE", "NL", "PT", "GR", "TR", "MX"][i % 16],
    language: ["EN (96%)", "DE (92%)", "FR (93%)", "ES (96%)", "IT (90%)", "PL (93%)", "EN (97%)", "EN (95%)", "EN (94%)", "JP (90%)", "SE (92%)", "NL (94%)", "PT (91%)", "EL (90%)", "TR (93%)", "ES (95%)"][i % 16],
    topic: topics[i % topics.length],
    status,
    scores: { total, safety, authority, relevance, commercial },
    trafficHistory: Array.from({ length: 12 }).map(() => rand(5, 40)),
    price: `$${rand(50, 500)}`,
    dr, orgTraffic, ldRdPct,
    topPage: { url: `https://domain${i + 1}.com/page/`, title: `Sample page ${i + 1}` },
    forbiddenOutgoingPct: (Math.random() * 3).toFixed(1),
    spamOutgoingPct: (Math.random() * 5).toFixed(1),
    preview: {
      anchorsOutgoing: makeAnchors(8),
      anchorsIncoming: makeAnchors(6),
      outgoingLinks: makeAnchors(10),
      keywordsTop50: makeKeywords(12),
      html: { title: `Verseo – Sample Title ${i+1}`, desc: "This is a meta description sample extracted from HTML for preview purposes." },
    },
  };
});

// ===== price decision =====
function priceDecision(d:any){
  const p = priceNum(d.price);
  const expected = 40 + d.dr*3 + Math.log10(Math.max(1, d.orgTraffic))*20; // ~40..400
  const ratio = p / expected;
  if(ratio < 0.75) return {label:"Below market (good deal)", tone:"emerald"};
  if(ratio <= 1.25) return {label:"Market fit", tone:"amber"};
  return {label:"Overpriced vs. signals", tone:"rose"};
}

// ===== small dropdowns for Filters =====
function useOutside(ref:any, onClose:()=>void){
  useEffect(()=>{
    function h(e:any){ if(ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener('mousedown', h); return ()=>document.removeEventListener('mousedown', h);
  },[ref,onClose]);
}
function Dropdown({label, children}:{label:string, children:any}){
  const [open,setOpen]=useState(false); const boxRef=useRef<any>(); useOutside(boxRef, ()=>setOpen(false));
  return (
    <div className="relative" ref={boxRef}>
      <Button variant="secondary" size="sm" onClick={()=>setOpen(o=>!o)}>{label}<Caret className="h-4 w-4"/></Button>
      {open && (
        <div className="absolute z-30 mt-1 w-56 rounded-md border border-slate-200 bg-white shadow-lg p-2 grid gap-1">
          {children}
        </div>
      )}
    </div>
  );
}

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
function AnalysisDashboard({ analyses, onNewAnalysis, onSelectAnalysis, isLoading }: any) {
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
                      <div className="py-4 px-6 text-sm text-slate-600">{analysis.name}</div>
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

// ===== Sidebar =====
function PreviewSidebar({ open, onClose, data }: any) {
  return (
    <div className={cls("fixed top-0 right-0 h-screen w-full sm:w-[520px] lg:w-[620px] z-50 transition-transform duration-300", open ? "translate-x-0" : "translate-x-full")} style={{ pointerEvents: open ? 'auto' : 'none' }}>
      <div className="h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="font-semibold">Quick Evidence Preview</div>
          <Button variant="secondary" onClick={onClose}><X className="h-5 w-5"/></Button>
        </div>
        {data ? (
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-4 gap-2 text-sm sticky top-0 bg-white py-1">
              <Badge>Outgoing</Badge>
              <Badge>Backlinks</Badge>
              <Badge>Top50 KW</Badge>
              <Badge>HTML</Badge>
            </div>
            <div className="mt-3 space-y-4 text-sm">
              <div>
                <div className="font-medium mb-2">Outgoing</div>
                <div className="max-h-[30vh] overflow-auto space-y-2">
                  {data.anchorsOutgoing.map((a:any, i:number)=> (
                    <div key={i} className="flex items-center justify-between gap-3 p-2 rounded border border-slate-200">
                      <div className="truncate"><span className="font-medium">{a.anchor}</span> → <a className="text-indigo-600 hover:underline" target="_blank" href={a.url}>{a.url}</a></div>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">{a.rel}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-medium mb-2">Backlinks</div>
                <div className="max-h-[30vh] overflow-auto space-y-2">
                  {data.anchorsIncoming.map((a:any, i:number)=> (
                    <div key={i} className="flex items-center justify-between gap-3 p-2 rounded border border-slate-200">
                      <div className="truncate"><span className="font-medium">{a.anchor}</span> ← <a className="text-indigo-600 hover:underline" target="_blank" href={a.url}>{a.url}</a></div>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">{a.rel}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-medium mb-2">Top50 KW</div>
                <div className="max-h-[30vh] overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500">
                      <tr><th className="py-1">Keyword</th><th className="py-1 text-right">Pos</th></tr>
                    </thead>
                    <tbody>
                      {data.keywordsTop50.map((k:any,i:number)=> (
                        <tr key={i} className="border-t">
                          <td className="py-1">{k.kw}</td>
                          <td className="py-1 text-right tabular-nums">{k.pos}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <div className="font-medium mb-2">Top page & Pricing insight</div>
                <div className="border rounded p-3 space-y-2">
                  <div><span className="text-slate-500">Top page: </span><span className="font-medium">{data.html?.title}</span></div>
                  <div><span className="text-slate-500">Description: </span><span>{data.html?.desc}</span></div>
                  <div className="pt-2">
                    <span className="text-slate-500 mr-2">Price decision:</span>
                    {(()=>{const dec = priceDecision({price:data.price||"$200", dr:60, orgTraffic:50000}); return <Badge tone={dec.tone as any}>{dec.label}</Badge>;})()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-slate-500 text-sm">No data</div>
        )}
      </div>
    </div>
  );
}

// ===== Analysis Results View =====
function AnalysisResults({ analysisId, onBack, DOMAINS }: any) {
  const [dark, setDark] = useState(false);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<any>({});
  const [selected, setSelected] = useState<any>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [sortKey, setSortKey] = useState<string|null>(null);
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  // dropdown filter states
  const [fTopics, setFTopics] = useState<string[]>([]);
  const [fCountries, setFCountries] = useState<string[]>([]);
  const [fPrice, setFPrice] = useState<string|null>(null); // lt150, 150-300, gt300
  const [fDR, setFDR] = useState<string|null>(null); // lt30 30-60 gt60
  const [fLDRD, setFLDRD] = useState<string|null>(null); // lt1 1-3 gt3

  const applyStatus = (st:string)=>{
    const selIds = Object.entries(selected).filter(([,v])=>v).map(([k])=>k);
    if(!selIds.length) return;
    selIds.forEach((id)=>{
      const d = DOMAINS.find((dd:any)=>dd.id===id);
      if(d) d.status = st as any;
    });
    setSelected({});
  };

  // keyboard shortcuts
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if(["INPUT","TEXTAREA"].includes((document.activeElement as any)?.tagName)) return;
      const selIds = Object.entries(selected).filter(([,v])=>v).map(([k])=>k);
      if(!selIds.length) return;
      if(e.key.toLowerCase()==='a') applyStatus('OK');
      if(e.key.toLowerCase()==='s') applyStatus('Review');
      if(e.key.toLowerCase()==='d') applyStatus('Reject');
      if(e.key.toLowerCase()==='o'){ const first=selIds[0]; setExpanded((p:any)=>({...p,[first]:!p[first]})); }
    };
    window.addEventListener('keydown', onKey); return ()=>window.removeEventListener('keydown', onKey);
  },[selected, DOMAINS]);
  // Top buttons: if есть выделение — применяем статус; иначе — фильтруем по статусу (повторный клик снимает фильтр)
  const handleTopAction = (st:string)=>{
    const hasSelection = Object.values(selected).some(Boolean);
    if(hasSelection) { applyStatus(st); }
    else { setFilter(prev => prev===st ? 'All' : st); }
  };

  // derived data & sorting
  const topics: string[] = Array.from(new Set(DOMAINS.map((d:any)=>d.topic as string)));
  const countries: string[] = Array.from(new Set(DOMAINS.map((d:any)=>d.country as string)));

  const filtered = useMemo(()=>{
    let arr = [...DOMAINS];
    if(filter!=="All") arr = arr.filter(d=> d.status===filter);
    if(q) arr = arr.filter(d=> d.domain.toLowerCase().includes(q.toLowerCase()));
    if(fTopics.length) arr = arr.filter(d=> fTopics.includes(d.topic));
    if(fCountries.length) arr = arr.filter(d=> fCountries.includes(d.country));
    if(fPrice){ const v = (p:number)=> (fPrice==='lt150'? p<150 : fPrice==='150-300'? (p>=150&&p<=300) : p>300); arr = arr.filter(d=> v(priceNum(d.price))); }
    if(fDR){ const v=(x:number)=> (fDR==='lt30'? x<30 : fDR==='30-60'? (x>=30&&x<=60) : x>60); arr = arr.filter(d=> v(d.dr)); }
    if(fLDRD){ const v=(x:number)=> (fLDRD==='lt1'? x<1 : fLDRD==='1-3'? (x>=1&&x<=3) : x>3); arr = arr.filter(d=> v(d.ldRdPct)); }
    if(sortKey){
      arr.sort((a:any,b:any)=>{
        const A = sortKey==='price'? priceNum(a.price) : sortKey==='dr'? a.dr : a.scores[sortKey as any];
        const B = sortKey==='price'? priceNum(b.price) : sortKey==='dr'? b.dr : b.scores[sortKey as any];
        return sortDir==='asc' ? (A-B) : (B-A);
      });
    }
    return arr;
  }, [DOMAINS,filter,q,fTopics,fCountries,fPrice,fDR,fLDRD,sortKey,sortDir]);

  const toggleSort = (key:string)=>{
    if(sortKey!==key){ setSortKey(key); setSortDir('desc'); }
    else setSortDir(sortDir==='desc'?'asc':'desc');
  };

  const openPreview=(d:any)=>{ setPreviewData({...d.preview, price:d.price}); setPreviewOpen(true); };
  const sortIcon=(key:string)=> sortKey===key ? (sortDir==='desc'?'▼':'▲') : '';

  return (
    <div className={cls("min-h-screen", dark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900")}> 
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4" />Back to Dashboard</Button>
            <VerseoLogo size={28} />
            <Badge>Analysis #{analysisId}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm"><Keyboard className="h-4 w-4"/>A OK · S Review · D Reject · O Open</div>
            <Button variant="outline"><Download className="h-4 w-4"/>Export</Button>
            <Button><Upload className="h-4 w-4"/>Upload</Button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <Sun className="h-4 w-4 text-slate-400"/>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={dark} onChange={(e)=>setDark(e.target.checked)} />
                <div className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-indigo-600 relative">
                  <div className={cls("h-5 w-5 bg-white rounded-full shadow transform transition", dark ? "translate-x-5" : "translate-x-0")}></div>
                </div>
              </label>
              <Moon className="h-4 w-4 text-slate-400"/>
            </div>
          </div>
        </div>

        {/* Top action buttons */}
        <div className="flex items-center gap-2 mb-3">
          <Button variant="secondary" onClick={()=>handleTopAction('OK')}><CheckCircle2 className="h-4 w-4"/>OK</Button>
          <Button variant="secondary" onClick={()=>handleTopAction('Review')}><AlertTriangle className="h-4 w-4"/>Review</Button>
          <Button variant="destructive" onClick={()=>handleTopAction('Reject')}><XCircle className="h-4 w-4"/>Reject</Button>
        </div>

        {/* Search + compact dropdown filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative w-full md:w-96 mr-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400"/>
            <Input placeholder="Search domains…" value={q} onChange={(e:any)=>setQ(e.target.value)} className="pl-8"/>
          </div>
          <Badge><Filter className="h-3.5 w-3.5 mr-1"/>Filters</Badge>
          <Dropdown label="Status">
            {['All','OK','Review','Reject'].map(s=> (
              <button key={s} className={cls("px-2 py-1 text-left rounded hover:bg-slate-50", filter===s && "bg-slate-100 font-medium")} onClick={()=> setFilter(s)}>{s}</button>
            ))}
          </Dropdown>
          <Dropdown label="Topic">
            {topics.map((t: string)=> (
              <label key={t} className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-slate-50">
                <span className="text-sm">{t}</span>
                <Checkbox checked={fTopics.includes(t)} onChange={(v:boolean)=> setFTopics(p=> v? [...p,t] : p.filter((x: string)=>x!==t))} />
              </label>
            ))}
            <Button variant="outline" size="sm" onClick={()=>setFTopics([])}>Clear</Button>
          </Dropdown>
          <Dropdown label="Country">
            {countries.map((c: string)=> (
              <label key={c} className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-slate-50">
                <span className="text-sm">{c}</span>
                <Checkbox checked={fCountries.includes(c)} onChange={(v:boolean)=> setFCountries(p=> v? [...p,c] : p.filter((x: string)=>x!==c))} />
              </label>
            ))}
            <Button variant="outline" size="sm" onClick={()=>setFCountries([])}>Clear</Button>
          </Dropdown>
          <Dropdown label="Price">
            {[['lt150','< $150'],['150-300','$150–300'],['gt300','> $300']].map(([k,label])=> (
              <button key={k} className={cls("px-2 py-1 text-left rounded hover:bg-slate-50", fPrice===k && "bg-slate-100 font-medium")} onClick={()=> setFPrice(fPrice===k?null:k as any)}>{label}</button>
            ))}
            <Button variant="outline" size="sm" onClick={()=>setFPrice(null)}>Clear</Button>
          </Dropdown>
          <Dropdown label="DR">
            {[['lt30','< 30'],['30-60','30–60'],['gt60','> 60']].map(([k,label])=> (
              <button key={k} className={cls("px-2 py-1 text-left rounded hover:bg-slate-50", fDR===k && "bg-slate-100 font-medium")} onClick={()=> setFDR(fDR===k?null:k as any)}>{label}</button>
            ))}
            <Button variant="outline" size="sm" onClick={()=>setFDR(null)}>Clear</Button>
          </Dropdown>
          <Dropdown label="LD/RD %">
            {[['lt1','< 1'],['1-3','1–3'],['gt3','> 3']].map(([k,label])=> (
              <button key={k} className={cls("px-2 py-1 text-left rounded hover:bg-slate-50", fLDRD===k && "bg-slate-100 font-medium")} onClick={()=> setFLDRD(fLDRD===k?null:k as any)}>{label}</button>
            ))}
            <Button variant="outline" size="sm" onClick={()=>setFLDRD(null)}>Clear</Button>
          </Dropdown>
          <Button variant="outline" size="sm" onClick={()=>{setFTopics([]);setFCountries([]);setFPrice(null);setFDR(null);setFLDRD(null);}}>Reset</Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="w-10"></th>
                <th className="w-10"></th>
                <th className="text-left py-2 px-3">Domain</th>
                <th className="text-right py-2 px-3">Geo</th>
                <th className="text-right py-2 px-3" onClick={()=>toggleSort('price')} style={{cursor:'pointer'}}>Price {sortIcon('price')}</th>
                <th className="text-left py-2 px-3">Topic</th>
                <th className="text-right py-2 px-3" onClick={()=>toggleSort('total')} style={{cursor:'pointer'}}>Score {sortIcon('total')}</th>
                <th className="text-right py-2 px-3" onClick={()=>toggleSort('safety')} style={{cursor:'pointer'}}>Safety {sortIcon('safety')}</th>
                <th className="text-right py-2 px-3">Authority</th>
                <th className="text-right py-2 px-3">Relevance</th>
                <th className="text-right py-2 px-3">Commercial</th>
                <th className="text-right py-2 px-3" onClick={()=>toggleSort('dr')} style={{cursor:'pointer'}}>DR {sortIcon('dr')}</th>
                <th className="text-left py-2 px-3">Organic</th>
                <th className="text-right py-2 px-3">Status</th>
                <th className="text-right py-2 px-3">Preview</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d:any) => (
                <React.Fragment key={d.id}>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2 px-3 align-middle"><Checkbox checked={!!selected[d.id]} onChange={(v:boolean)=> setSelected((p:any)=>({ ...p, [d.id]: v }))}/></td>
                    <td className="py-2 px-3 align-middle">
                      <button onClick={()=> setExpanded((p:any)=>({ ...p, [d.id]: !p[d.id] }))} className="p-1 rounded hover:bg-slate-100">
                        {expanded[d.id] ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                      </button>
                    </td>
                    <td className="py-2 px-3 align-middle">
                      <div className="font-medium leading-tight">{d.domain}</div>
                      <div className="text-xs text-slate-500">{d.topPage.title}</div>
                    </td>
                    <td className="py-2 px-3 align-middle text-right">
                      <div className="text-sm tabular-nums">{d.country}</div>
                      <div className="text-xs text-slate-500">{d.language}</div>
                    </td>
                    <td className="py-2 px-3 align-middle text-right tabular-nums">{d.price}</td>
                    <td className="py-2 px-3 align-middle">{d.topic}</td>
                    <td className="py-2 px-3 align-middle text-right"><MetricCell value={d.scores.total}/></td>
                    <td className="py-2 px-3 align-middle text-right"><MetricCell value={d.scores.safety}/></td>
                    <td className="py-2 px-3 align-middle text-right"><MetricCell value={d.scores.authority}/></td>
                    <td className="py-2 px-3 align-middle text-right"><MetricCell value={d.scores.relevance}/></td>
                    <td className="py-2 px-3 align-middle text-right"><MetricCell value={d.scores.commercial}/></td>
                    <td className="py-2 px-3 align-middle text-right"><MetricCell value={d.dr}/></td>
                    <td className="py-2 px-3 align-middle"><Sparkline data={d.trafficHistory} /></td>
                    <td className="py-2 px-3 align-middle text-right"><Badge tone={d.status==='OK'?'emerald':d.status==='Review'?'amber':'rose'}>{d.status}</Badge></td>
                    <td className="py-2 px-3 align-middle text-right">
                      <Button variant="secondary" size="sm" onClick={()=> openPreview(d)}><Eye className="h-4 w-4"/>Open</Button>
                    </td>
                  </tr>

                  {expanded[d.id] && (
                    <tr className="bg-slate-50">
                      <td colSpan={15} className="p-3">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="border rounded p-3">
                            <div className="font-semibold text-sm mb-2">Quality signals</div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between"><div className="text-slate-500">DR</div><div className="font-medium tabular-nums">{d.dr}</div></div>
                              <div className="flex items-center justify-between"><div className="text-slate-500">Org traffic</div><div className="font-medium tabular-nums">{d.orgTraffic}</div></div>
                              <div className="flex items-center justify-between"><div className="text-slate-500">LD/RD %</div><div className="font-medium tabular-nums">{d.ldRdPct}%</div></div>
                              <div className="flex items-center justify-between"><div className="text-slate-500">Price</div><div className="font-medium">{d.price}</div></div>
                            </div>
                          </div>
                          <div className="border rounded p-3">
                            <div className="font-semibold text-sm mb-2">Anchors & Keywords</div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between"><div className="text-slate-500">Forbidden (out anchors)</div><div className="font-medium">{d.forbiddenOutgoingPct}%</div></div>
                              <div className="flex items-center justify-between"><div className="text-slate-500">Spam (out anchors)</div><div className="font-medium">{d.spamOutgoingPct}%</div></div>
                            </div>
                          </div>
                          <div className="border rounded p-3">
                            <div className="font-semibold text-sm mb-2">Top page & Pricing</div>
                            <div className="space-y-2 text-sm">
                              <div>
                                <div className="text-slate-500">Top page</div>
                                <a href={d.topPage.url} target="_blank" className="text-indigo-600 hover:underline break-all">{d.topPage.title}</a>
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <div className="text-slate-500">Pricing decision</div>
                                {(()=>{ const dec = priceDecision(d); return <Badge tone={dec.tone as any}>{dec.label}</Badge>; })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky decision bar (kept minimal) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 overflow-x-auto">
          <div className="flex items-center gap-2"><span className="text-sm text-slate-500">Selected:</span><Badge tone="slate">{Object.values(selected).filter(Boolean).length}</Badge></div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={()=>applyStatus('OK')}><CheckCircle2 className="h-4 w-4"/>OK</Button>
            <Button variant="secondary" onClick={()=>applyStatus('Review')}><AlertTriangle className="h-4 w-4"/>Review</Button>
            <Button variant="destructive" onClick={()=>applyStatus('Reject')}><XCircle className="h-4 w-4"/>Reject</Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <PreviewSidebar open={previewOpen} onClose={()=>setPreviewOpen(false)} data={previewData} />
    </div>
  );
}

// ===== Main App with Navigation =====
export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'results'>('dashboard');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch analyses from API on mount and periodically
  useEffect(() => {
    fetchAnalyses();
    
    // Refresh analyses every 2 seconds to see status updates
    const refreshInterval = setInterval(fetchAnalyses, 2000);
    
    return () => clearInterval(refreshInterval);
  }, []);

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
          // If completed, we would fetch domains separately or they'd be included
          domains: a.id === '1' ? MOCK_DOMAINS : undefined, // Temporary: keep mock data for first analysis
        }));
        
        setAnalyses(analysesData);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
      setIsLoading(false);
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

  const handleSelectAnalysis = (id: string) => {
    setSelectedAnalysisId(id);
    setCurrentView('results');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedAnalysisId(null);
  };

  const selectedAnalysis = analyses.find(a => a.id === selectedAnalysisId);

  if (currentView === 'results' && selectedAnalysis && selectedAnalysis.domains) {
    return (
      <AnalysisResults
        analysisId={selectedAnalysis.id}
        onBack={handleBackToDashboard}
        DOMAINS={selectedAnalysis.domains}
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
