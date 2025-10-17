import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2, XCircle, AlertTriangle, ChevronRight, ChevronDown, Download, Upload,
  Sun, Moon, Search, Eye, X, Filter, Keyboard, ChevronDown as Caret, ArrowLeft
} from "lucide-react";
import { Badge, Button, Input, Checkbox, VerseoLogo, cls } from "../components/UIComponents";
import { Sparkline } from "../components/Sparkline";
import { DomainData } from "../types";
import { dotClass, priceNum, priceDecision } from "../utils";

// ===== small dropdowns for Filters =====
function useOutside(ref: any, onClose: () => void) {
  useEffect(() => {
    function h(e: any) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, [ref, onClose]);
}

function Dropdown({ label, children }: { label: string, children: any }) {
  const [open, setOpen] = useState(false); const boxRef = useRef<any>(); useOutside(boxRef, () => setOpen(false));
  return (
    <div className="relative" ref={boxRef}>
      <Button variant="secondary" size="sm" onClick={() => setOpen(o => !o)}>{label}<Caret className="h-4 w-4" /></Button>
      {open && (
        <div className="absolute z-30 mt-1 w-56 rounded-md border border-slate-200 bg-white shadow-lg p-2 grid gap-1">
          {children}
        </div>
      )}
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
          <Button variant="secondary" onClick={onClose}><X className="h-5 w-5" /></Button>
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
                  {data.anchorsOutgoing?.map((a: any, i: number) => (
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
                  {data.anchorsIncoming?.map((a: any, i: number) => (
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
                      {data.keywordsTop50?.map((k: any, i: number) => (
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
                    {(() => { const dec = priceDecision({ price: data.price || "$200", dr: 60, orgTraffic: 50000 }); return <Badge tone={dec.tone as any}>{dec.label}</Badge>; })()}
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
export default function AnalysisResults({ analysisId, onBack, DOMAINS }: {
  analysisId: string;
  onBack: () => void;
  DOMAINS: DomainData[];
}) {
  const [dark, setDark] = useState(false);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<any>({});
  const [selected, setSelected] = useState<any>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // dropdown filter states
  const [fTopics, setFTopics] = useState<string[]>([]);
  const [fCountries, setFCountries] = useState<string[]>([]);
  const [fPrice, setFPrice] = useState<string | null>(null); // lt150, 150-300, gt300
  const [fDR, setFDR] = useState<string | null>(null); // lt30 30-60 gt60
  const [fLDRD, setFLDRD] = useState<string | null>(null); // lt1 1-3 gt3

  const applyStatus = (st: string) => {
    const selIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (!selIds.length) return;
    selIds.forEach((id) => {
      const d = DOMAINS.find((dd: any) => dd.id === id);
      if (d) d.status = st as any;
    });
    setSelected({});
  };

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((document.activeElement as any)?.tagName)) return;
      const selIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
      if (!selIds.length) return;
      if (e.key.toLowerCase() === 'a') applyStatus('OK');
      if (e.key.toLowerCase() === 's') applyStatus('Review');
      if (e.key.toLowerCase() === 'd') applyStatus('Reject');
      if (e.key.toLowerCase() === 'o') { const first = selIds[0]; setExpanded((p: any) => ({ ...p, [first]: !p[first] })); }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [selected, DOMAINS]);

  // Top buttons: if есть выделение — применяем статус; иначе — фильтруем по статусу (повторный клик снимает фильтр)
  const handleTopAction = (st: string) => {
    const hasSelection = Object.values(selected).some(Boolean);
    if (hasSelection) { applyStatus(st); }
    else { setFilter(prev => prev === st ? 'All' : st); }
  };

  // derived data & sorting
  const topics: string[] = Array.from(new Set(DOMAINS.map((d: any) => d.topic as string)));
  const countries: string[] = Array.from(new Set(DOMAINS.map((d: any) => d.country as string)));

  const filtered = useMemo(() => {
    let arr = [...DOMAINS];
    if (filter !== "All") arr = arr.filter(d => d.status === filter);
    if (q) arr = arr.filter(d => d.domain.toLowerCase().includes(q.toLowerCase()));
    if (fTopics.length) arr = arr.filter(d => fTopics.includes((d as any).topic));
    if (fCountries.length) arr = arr.filter(d => fCountries.includes((d as any).country));
    if (fPrice) { const v = (p: number) => (fPrice === 'lt150' ? p < 150 : fPrice === '150-300' ? (p >= 150 && p <= 300) : p > 300); arr = arr.filter(d => v(priceNum(d.price))); }
    if (fDR) { const v = (x: number) => (fDR === 'lt30' ? x < 30 : fDR === '30-60' ? (x >= 30 && x <= 60) : x > 60); arr = arr.filter(d => v(d.dr)); }
    if (fLDRD) { const v = (x: number) => (fLDRD === 'lt1' ? x < 1 : fLDRD === '1-3' ? (x >= 1 && x <= 3) : x > 3); arr = arr.filter(d => v(d.ld_lr_ratio)); }
    if (sortKey) {
      arr.sort((a: any, b: any) => {
        const A = sortKey === 'price' ? priceNum(a.price) : sortKey === 'dr' ? a.dr : a.scores[sortKey as any];
        const B = sortKey === 'price' ? priceNum(b.price) : sortKey === 'dr' ? b.dr : b.scores[sortKey as any];
        return sortDir === 'asc' ? (A - B) : (B - A);
      });
    }
    return arr;
  }, [DOMAINS, filter, q, fTopics, fCountries, fPrice, fDR, fLDRD, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('desc'); }
    else setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
  };

  const openPreview = (d: any) => { setPreviewData({ ...d.preview, price: d.price }); setPreviewOpen(true); };
  const sortIcon = (key: string) => sortKey === key ? (sortDir === 'desc' ? '▼' : '▲') : '';

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
            <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm"><Keyboard className="h-4 w-4" />A OK · S Review · D Reject · O Open</div>
            <Button variant="outline"><Download className="h-4 w-4" />Export</Button>
            <Button><Upload className="h-4 w-4" />Upload</Button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <Sun className="h-4 w-4 text-slate-400" />
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={dark} onChange={(e) => setDark(e.target.checked)} />
                <div className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-indigo-600 relative">
                  <div className={cls("h-5 w-5 bg-white rounded-full shadow transform transition", dark ? "translate-x-5" : "translate-x-0")}></div>
                </div>
              </label>
              <Moon className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Top action buttons */}
        <div className="flex items-center gap-2 mb-3">
          <Button variant="secondary" onClick={() => handleTopAction('OK')}><CheckCircle2 className="h-4 w-4" />OK</Button>
          <Button variant="secondary" onClick={() => handleTopAction('Review')}><AlertTriangle className="h-4 w-4" />Review</Button>
          <Button variant="destructive" onClick={() => handleTopAction('Reject')}><XCircle className="h-4 w-4" />Reject</Button>
        </div>

        {/* Search + compact dropdown filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative w-full md:w-96 mr-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search domains…" value={q} onChange={(e: any) => setQ(e.target.value)} className="pl-8" />
          </div>
          <Badge><Filter className="h-3.5 w-3.5 mr-1" />Filters</Badge>
          <Dropdown label="Status">
            {['All', 'OK', 'Review', 'Reject'].map(s => (
              <button key={s} className={cls("px-2 py-1 text-left rounded hover:bg-slate-50", filter === s && "bg-slate-100 font-medium")} onClick={() => setFilter(s)}>{s}</button>
            ))}
          </Dropdown>
          <Dropdown label="Topic">
            {topics.map((t: string) => (
              <label key={t} className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-slate-50">
                <span className="text-sm">{t}</span>
                <Checkbox checked={fTopics.includes(t)} onChange={(v: boolean) => setFTopics(p => v ? [...p, t] : p.filter((x: string) => x !== t))} />
              </label>
            ))}
            <Button variant="outline" size="sm" onClick={() => setFTopics([])}>Clear</Button>
          </Dropdown>
          <Dropdown label="Country">
            {countries.map((c: string) => (
              <label key={c} className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-slate-50">
                <span className="text-sm">{c}</span>
                <Checkbox checked={fCountries.includes(c)} onChange={(v: boolean) => setFCountries(p => v ? [...p, c] : p.filter((x: string) => x !== c))} />
              </label>
            ))}
            <Button variant="outline" size="sm" onClick={() => setFCountries([])}>Clear</Button>
          </Dropdown>
          <Dropdown label="Price">
            {[['lt150', '< $150'], ['150-300', '$150–300'], ['gt300', '> $300']].map(([k, label]) => (
              <button key={k} className={cls("px-2 py-1 text-left rounded hover:bg-slate-50", fPrice === k && "bg-slate-100 font-medium")} onClick={() => setFPrice(fPrice === k ? null : k as any)}>{label}</button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setFPrice(null)}>Clear</Button>
          </Dropdown>
          <Dropdown label="DR">
            {[['lt30', '< 30'], ['30-60', '30–60'], ['gt60', '> 60']].map(([k, label]) => (
              <button key={k} className={cls("px-2 py-1 text-left rounded hover:bg-slate-50", fDR === k && "bg-slate-100 font-medium")} onClick={() => setFDR(fDR === k ? null : k as any)}>{label}</button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setFDR(null)}>Clear</Button>
          </Dropdown>
          <Dropdown label="LD/RD %">
            {[['lt1', '< 1'], ['1-3', '1–3'], ['gt3', '> 3']].map(([k, label]) => (
              <button key={k} className={cls("px-2 py-1 text-left rounded hover:bg-slate-50", fLDRD === k && "bg-slate-100 font-medium")} onClick={() => setFLDRD(fLDRD === k ? null : k as any)}>{label}</button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setFLDRD(null)}>Clear</Button>
          </Dropdown>
          <Button variant="outline" size="sm" onClick={() => { setFTopics([]); setFCountries([]); setFPrice(null); setFDR(null); setFLDRD(null); }}>Reset</Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="w-10"></th>
                <th className="w-10"></th>
                <th className="text-left py-2 px-3 whitespace-nowrap">Domain</th>
                <th className="text-right py-2 px-3 whitespace-nowrap" onClick={() => toggleSort('price')} style={{ cursor: 'pointer' }}>Price, USD {sortIcon('price')}</th>
                <th className="text-right py-2 px-3 whitespace-nowrap" onClick={() => toggleSort('total')} style={{ cursor: 'pointer' }}>Overall Score {sortIcon('total')}</th>
                <th className="text-right py-2 px-3 whitespace-nowrap" onClick={() => toggleSort('dr')} style={{ cursor: 'pointer' }}>DR {sortIcon('dr')}</th>
                <th className="text-right py-2 px-3 whitespace-nowrap">Organic Traffic<br />(by country)</th>
                <th className="text-left py-2 px-3 whitespace-nowrap">Organic Traffic<br />History</th>
                <th className="text-right py-2 px-3 whitespace-nowrap">Geography</th>
                <th className="text-right py-2 px-3 whitespace-nowrap">Linked Domains /<br />Referring Domains</th>
                <th className="text-left py-2 px-3 whitespace-nowrap">Top Page</th>
                <th className="text-right py-2 px-3 whitespace-nowrap">Backlinks:<br />Forbidden Words</th>
                <th className="text-right py-2 px-3 whitespace-nowrap">Anchors:<br />Spam Words</th>
                <th className="text-right py-2 px-3 whitespace-nowrap">Anchors:<br />Forbidden Words</th>
                <th className="text-right py-2 px-3 whitespace-nowrap">Organic Keywords:<br />Forbidden Words</th>
                <th className="text-right py-2 px-3 whitespace-nowrap">Organic Keywords:<br />Spam Words</th>
                <th className="text-right py-2 px-3 whitespace-nowrap">Status</th>
                <th className="text-right py-2 px-3 whitespace-nowrap">Preview</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d: any) => (
                <React.Fragment key={d.id}>
                  <tr className="hover:bg-slate-50 border-b-0">
                    <td className="py-2 px-3 align-middle" rowSpan={2}><Checkbox checked={!!selected[d.id]} onChange={(v: boolean) => setSelected((p: any) => ({ ...p, [d.id]: v }))} /></td>
                    <td className="py-2 px-3 align-middle" rowSpan={2}>
                      <button onClick={() => setExpanded((p: any) => ({ ...p, [d.id]: !p[d.id] }))} className="p-1 rounded hover:bg-slate-100">
                        {expanded[d.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    {/* Domain */}
                    <td className="py-1 px-3 align-middle" rowSpan={2}>
                      <div className="font-medium leading-tight">{d.domain}</div>
                    </td>
                    {/* Price - Semaphore + Value */}
                    <td className="py-1 px-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-medium tabular-nums text-sm">{d.price}</span>
                      </div>
                    </td>
                    {/* Overall Score - Semaphore + Score */}
                    <td className="py-1 px-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={cls("h-3 w-3 rounded-full", dotClass(d.scores.overall))}></span>
                        <span className="font-semibold tabular-nums">{d.scores.overall}</span>
                      </div>
                    </td>
                    {/* DR - Semaphore + Score */}
                    <td className="py-1 px-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={cls("h-3 w-3 rounded-full", dotClass(d.scores.DomainRatingRule))}></span>
                        <span className="font-medium tabular-nums">{d.scores.DomainRatingRule}</span>
                      </div>
                    </td>
                    {/* Organic Traffic - Semaphore + Score */}
                    <td className="py-1 px-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={cls("h-3 w-3 rounded-full", dotClass(d.scores.OrganicTrafficRule))}></span>
                        <span className="font-medium tabular-nums">{d.scores.OrganicTrafficRule}</span>
                      </div>
                    </td>
                    {/* Organic Traffic History - Semaphore + Score */}
                    <td className="py-1 px-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={cls("h-3 w-3 rounded-full", dotClass(d.scores.HistoricalOrganicTrafficRule))}></span>
                        <span className="font-medium tabular-nums">{d.scores.HistoricalOrganicTrafficRule}</span>
                      </div>
                    </td>
                    {/* Geography - Semaphore + Score */}
                    <td className="py-1 px-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={cls("h-3 w-3 rounded-full", dotClass(d.scores.GeographyRule))}></span>
                        <span className="font-medium tabular-nums">{d.scores.GeographyRule}</span>
                      </div>
                    </td>
                    {/* LD/RD - Semaphore + Score */}
                    <td className="py-1 px-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={cls("h-3 w-3 rounded-full", dotClass(d.scores.DomainsInOutLinksRatioRule))}></span>
                        <span className="font-medium tabular-nums">{d.scores.DomainsInOutLinksRatioRule}</span>
                      </div>
                    </td>
                    {/* Top Page - Semaphore + Score */}
                    <td className="py-1 px-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={cls("h-3 w-3 rounded-full", dotClass(d.scores.SingleTopPageTrafficRule))}></span>
                        <span className="font-medium tabular-nums">{d.scores.SingleTopPageTrafficRule}</span>
                      </div>
                    </td>
                    {/* Backlinks: Forbidden Words - Semaphore + Score */}
                    <td className="py-1 px-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={cls("h-3 w-3 rounded-full", dotClass(d.scores.ForbiddenWordsBacklinksRule))}></span>
                        <span className="font-medium tabular-nums">{d.scores.ForbiddenWordsBacklinksRule}</span>
                      </div>
                    </td>
                    {/* Anchors: Spam Words - Semaphore + Score */}
                    <td className="py-1 px-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={cls("h-3 w-3 rounded-full", dotClass(d.scores.SpamWordsAnchorsRule))}></span>
                        <span className="font-medium tabular-nums">{d.scores.SpamWordsAnchorsRule}</span>
                      </div>
                    </td>
                    {/* Anchors: Forbidden Words - Semaphore + Score */}
                    <td className="py-1 px-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={cls("h-3 w-3 rounded-full", dotClass(d.scores.ForbiddenWordsAnchorRule))}></span>
                        <span className="font-medium tabular-nums">{d.scores.ForbiddenWordsAnchorRule}</span>
                      </div>
                    </td>
                    {/* Organic Keywords: Forbidden Words - Semaphore + Score */}
                    <td className="py-1 px-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={cls("h-3 w-3 rounded-full", dotClass(d.scores.ForbiddenWordsOrganicKeywordsRule))}></span>
                        <span className="font-medium tabular-nums">{d.scores.ForbiddenWordsOrganicKeywordsRule}</span>
                      </div>
                    </td>
                    {/* Organic Keywords: Spam Words - Semaphore + Score */}
                    <td className="py-1 px-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={cls("h-3 w-3 rounded-full", dotClass(d.scores.SpamWordsOrganicKeywordsRule))}></span>
                        <span className="font-medium tabular-nums">{d.scores.SpamWordsOrganicKeywordsRule}</span>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="py-1 px-3 align-middle text-right" rowSpan={2}>
                      <div className="relative group inline-block">
                        <Badge tone={d.status === 'OK' ? 'emerald' : d.status === 'Review' ? 'amber' : 'rose'}>
                          {d.status}
                        </Badge>
                        {d.status === 'Reject' && d.criticalViolations && d.criticalViolations.length > 0 && (
                          <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-50 w-64">
                            <div className="bg-slate-900 text-white text-xs rounded-lg shadow-xl p-3 border border-slate-700">
                              <div className="font-semibold mb-2 text-rose-300">Critical Violations:</div>
                              <ul className="space-y-1">
                                {d.criticalViolations.map((rule: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-rose-400 mt-0.5">•</span>
                                    <span>{rule}</span>
                                  </li>
                                ))}
                              </ul>
                              <div className="absolute top-full right-4 -mt-1">
                                <div className="border-8 border-transparent border-t-slate-900"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Preview */}
                    <td className="py-1 px-3 align-middle text-right" rowSpan={2}>
                      <Button variant="secondary" size="sm" onClick={() => openPreview(d)}><Eye className="h-4 w-4" />Open</Button>
                    </td>
                  </tr>

                  {/* Bottom Sub-Row: Detailed Information */}
                  <tr className="hover:bg-slate-50 border-t-0">
                    {/* Price - Details */}
                    <td className="py-1 px-3 align-top">
                      
                    </td>
                    {/* Overall Score - Details */}
                    <td className="py-1 px-3 align-top">

                    </td>
                    {/* DR - Details */}
                    <td className="py-1 px-3 align-top text-right">
                      <div className="text-xs text-slate-500">
                        DR: <span className="font-medium">{d.dr}</span>
                      </div>
                    </td>
                    {/* Organic Traffic (by country) - Details */}
                    <td className="py-1 px-3 align-top text-right">
                      {Object.entries(d.org_traffic || {})
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([country, traffic]) => (
                          <div key={country} className="text-xs text-slate-500">
                            <span className="font-medium uppercase">{country}</span>: {(traffic as number).toLocaleString()}
                          </div>
                        ))}
                    </td>
                    {/* Organic Traffic History - Chart */}
                    <td className="py-1 px-3 align-top">
                      <Sparkline data={
                        Object.entries(d.org_traffic_history || {})
                          .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                          .map(([, value]) => value)
                      } />
                    </td>
                    {/* Geography - Details */}
                    <td className="py-1 px-3 align-top text-right">
                      <div className="text-xs text-slate-500">{(d as any).language || '—'}</div>
                    </td>
                    {/* Linked Domains / Referring Domains - Details */}
                    <td className="py-1 px-3 align-top text-right">
                      <div className="text-xs text-slate-500">LD/RD Ratio: {d.ld_lr_ratio.toFixed(2)}</div>
                    </td>
                    {/* Top Page - Details */}
                    <td className="py-1 px-3 align-top">
                      <div className="text-xs text-slate-500 truncate max-w-xs">Top page traffic: {d.top_page_traffic_pct}%</div>
                    </td>
                    {/* Backlinks: Forbidden Words - Details */}
                    <td className="py-1 px-3 align-top text-right">
                      <div className="text-xs text-slate-400">Num words: {d.backlinks_forbidden_words}</div>
                    </td>
                    {/* Anchors: Spam Words - Details */}
                    <td className="py-1 px-3 align-top text-right">
                      <div className="text-xs text-slate-500">Num words: {d.anchors_spam_words}</div>
                    </td>
                    {/* Anchors: Forbidden Words - Details */}
                    <td className="py-1 px-3 align-top text-right">
                      <div className="text-xs text-slate-500">Num words: {d.anchors_forbidden_words}</div>
                    </td>
                    {/* Organic Keywords: Forbidden Words - Details */}
                    <td className="py-1 px-3 align-top text-right">
                      <div className="text-xs text-slate-400">Num words: {d.organic_keywords_forbidden_words}</div>
                    </td>
                    {/* Organic Keywords: Spam Words - Details */}
                    <td className="py-1 px-3 align-top text-right">
                      <div className="text-xs text-slate-400">Num words: {d.organic_keywords_spam_words}</div>
                    </td>
                  </tr>

                  {expanded[d.id] && (
                    <tr className="bg-slate-50">
                      <td colSpan={18} className="p-3">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="border rounded p-3">
                            <div className="font-semibold text-sm mb-2">Quality signals</div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between"><div className="text-slate-500">DR</div><div className="font-medium tabular-nums">{d.dr}</div></div>
                              <div className="flex items-center justify-between"><div className="text-slate-500">Org traffic</div><div className="font-medium tabular-nums">{Object.values(d.org_traffic || {}).reduce((sum: number, val: any) => sum + val, 0).toLocaleString()}</div></div>
                              <div className="flex items-center justify-between"><div className="text-slate-500">LD/RD Ratio</div><div className="font-medium tabular-nums">{d.ld_lr_ratio.toFixed(2)}</div></div>
                              <div className="flex items-center justify-between"><div className="text-slate-500">Price</div><div className="font-medium">{d.price}</div></div>
                            </div>
                          </div>
                          <div className="border rounded p-3">
                            <div className="font-semibold text-sm mb-2">Anchors & Keywords</div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between"><div className="text-slate-500">Backlinks: Forbidden words</div><div className="font-medium">{d.backlinks_forbidden_words}</div></div>
                              <div className="flex items-center justify-between"><div className="text-slate-500">Anchors: Spam words</div><div className="font-medium">{d.anchors_spam_words}</div></div>
                              <div className="flex items-center justify-between"><div className="text-slate-500">Anchors: Forbidden words</div><div className="font-medium">{d.anchors_forbidden_words}</div></div>
                              <div className="flex items-center justify-between"><div className="text-slate-500">Keywords: Forbidden words</div><div className="font-medium">{d.organic_keywords_forbidden_words}</div></div>
                              <div className="flex items-center justify-between"><div className="text-slate-500">Keywords: Spam words</div><div className="font-medium">{d.organic_keywords_spam_words}</div></div>
                            </div>
                          </div>
                          <div className="border rounded p-3">
                            <div className="font-semibold text-sm mb-2">Top page & Traffic</div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <div className="text-slate-500">Top page traffic %</div>
                                <div className="font-medium tabular-nums">{d.top_page_traffic_pct}%</div>
                              </div>
                              <div>
                                <div className="text-slate-500 mb-1">Traffic by country:</div>
                                {Object.entries(d.org_traffic || {})
                                  .sort(([, a], [, b]) => (b as number) - (a as number))
                                  .map(([country, traffic]) => (
                                    <div key={country} className="flex items-center justify-between text-xs">
                                      <span className="uppercase font-medium">{country}</span>
                                      <span className="tabular-nums">{(traffic as number).toLocaleString()}</span>
                                    </div>
                                  ))}
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
            <Button variant="secondary" onClick={() => applyStatus('OK')}><CheckCircle2 className="h-4 w-4" />OK</Button>
            <Button variant="secondary" onClick={() => applyStatus('Review')}><AlertTriangle className="h-4 w-4" />Review</Button>
            <Button variant="destructive" onClick={() => applyStatus('Reject')}><XCircle className="h-4 w-4" />Reject</Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <PreviewSidebar open={previewOpen} onClose={() => setPreviewOpen(false)} data={previewData} />
    </div>
  );
}


