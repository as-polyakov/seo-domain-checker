// ===== UI helpers (Tailwind) =====
export const cls = (...a: any[]) => a.filter(Boolean).join(" ");

export const Badge = ({ children, tone = "slate" }: any) => (
  <span className={cls(
    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
    tone === "emerald" && "bg-emerald-100 text-emerald-800",
    tone === "amber" && "bg-amber-100 text-amber-800",
    tone === "rose" && "bg-rose-100 text-rose-800",
    tone === "blue" && "bg-blue-100 text-blue-800",
    tone === "slate" && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
  )}>{children}</span>
);

export const Button = ({ children, onClick, variant = "default", size = "md", className, disabled }: any) => (
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

export const Input = (props: any) => <input {...props} className={cls("w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700", props.className)} />;

export const Checkbox = ({ checked, onChange }: any) => (
  <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
);

// ===== logo (planet) =====
export const VerseoLogo = ({ size = 24 }: any) => (
  <div className="flex items-center gap-2 select-none">
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="18" className="stroke-indigo-600" strokeWidth="2" fill="none" />
      <path d="M8 32c10-8 38-8 48 0" className="stroke-indigo-400" strokeWidth="2" fill="none" />
      <path d="M16 20c8 6 24 6 32 0" className="stroke-indigo-300" strokeWidth="2" fill="none" />
      <path d="M16 44c8-6 24-6 32 0" className="stroke-indigo-300" strokeWidth="2" fill="none" />
      <circle cx="18" cy="26" r="2" className="fill-emerald-400" />
      <circle cx="46" cy="26" r="2" className="fill-amber-400" />
      <circle cx="32" cy="38" r="2" className="fill-rose-400" />
    </svg>
    <span className="font-bold tracking-tight text-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-transparent bg-clip-text">Verseo</span>
  </div>
);

