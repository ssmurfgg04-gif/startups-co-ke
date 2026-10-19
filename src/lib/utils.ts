/** Shared helpers, formatting, seeded pseudo-random, dates. */

export function initials(name: string): string {
  const words = name.replace(/[^a-zA-Z ]/g, '').split(/\s+/).filter(Boolean);
  return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

/** USD millions → "$1.2M" / "$420K" style. amount given in USD millions. */
export function fmtUsdM(m: number): string {
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`;
  if (m >= 1) return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  return `$${Math.round(m * 1000)}K`;
}

export function fmtKsh(n: number): string {
  return `KSh ${n.toLocaleString('en-KE')}`;
}

/** Deterministic string hash → 32-bit int. */
export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 seeded PRNG, stable sparklines/charts across reloads. */
export function prng(seed: string | number): () => number {
  let a = typeof seed === 'string' ? hashStr(seed) : seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sparklinePoints(id: string, weeks = 12, w = 120, h = 36, drift = 0.18): string {
  const r = prng(id);
  const pts: string[] = [];
  let v = 0.45 + r() * 0.2;
  const dir = r() > 0.3 ? 1 : -1;
  for (let i = 0; i < weeks; i++) {
    v += (r() - 0.5) * 0.14 + dir * drift * 0.09;
    v = Math.min(0.95, Math.max(0.08, v));
    const x = ((i / (weeks - 1)) * (w - 4) + 2).toFixed(1);
    const y = (h - 3 - v * (h - 8)).toFixed(1);
    pts.push(`${x},${y}`);
  }
  return pts.join(' ');
}

export function relDays(days: number): string {
  if (!Number.isFinite(days)) return 'Date unavailable';
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 31) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} mo ago`;
}

/** Feed money: an unknown amount renders "Undisclosed", never $0K (audit fix). */
export function fmtAmount(m: number | null | undefined): string {
  if (m == null || !Number.isFinite(m) || m <= 0) return 'Undisclosed';
  return fmtUsdM(m);
}

/** Safe relative date for feed rows, blank/unparseable dates render honestly. */
export function relDate(date: string | null | undefined): string {
  if (!date || !date.trim()) return 'Date unavailable';
  const t = Date.parse(date);
  if (Number.isNaN(t)) return 'Date unavailable';
  return relDays(Math.max(0, Math.round((Date.now() - t) / 86400000)));
}

export function pct(n: number, total: number): number {
  return Math.round((n / total) * 100);
}

export function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
