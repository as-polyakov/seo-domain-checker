// ===== Helper Functions =====

export const priceNum = (p: string) => Number(String(p).replace(/[^0-9.]/g, "")) || 0;

export const cls = (...a: any[]) => a.filter(Boolean).join(" ");

// Generic semaphore function: score > 60 = green, 30-60 = yellow, < 30 = red
export const getSemaphoreColor = (score: number) => {
  const v = Number(score);
  if (Number.isNaN(v)) return "bg-slate-300";
  if (v > 60) return "bg-emerald-500";
  if (v >= 30) return "bg-amber-500";
  return "bg-rose-500";
};

// Legacy function for backwards compatibility
export const dotClass = getSemaphoreColor;

// Price decision helper
export function priceDecision(d: any) {
  const p = priceNum(d.price);
  const expected = 40 + d.dr * 3 + Math.log10(Math.max(1, d.orgTraffic)) * 20; // ~40..400
  const ratio = p / expected;
  if (ratio < 0.75) return { label: "Below market (good deal)", tone: "emerald" };
  if (ratio <= 1.25) return { label: "Market fit", tone: "amber" };
  return { label: "Overpriced vs. signals", tone: "rose" };
}


