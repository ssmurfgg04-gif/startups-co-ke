import type { WireItem } from './types';

/**
 * Headline stats — REAL tracked counts + sourced market figures (as of 2026-10-15).
 * Market figures carry their source in the UI where they appear.
 */
export const STATS = {
  companiesTracked: 21, // = COMPANIES.length, real tracked profiles
  activeInvestors: 13, // = INVESTORS.length, real tracked investors
  openTechJobs: 8, // = JOBS.length, roles seen live on employer boards
  hackathonsIndexed: 12, // = HACKATHONS.length, real events
  capitalYTD: 126, // H1 2026 equity, $M (Business Daily) — labelled in UI
  capital2025: 984, // 2025 equity total, $M (Tech In Africa / Fintech Assoc. Kenya)
  capital2025InclDebt: 1040, // $M incl. debt (Invest Kenya)
  medianSeed: 1600, // median of tracked seed-stage rounds ≈ $1.6M — derived from tracked data
  h1YoY: -44.5, // % change vs H1 2025 (Business Daily)
  investorLossesKsh: 93, // Sh93bn across 13 failures (Business Daily, Sep 16 2026)
  failuresTracked: 13,
};

/** County spread of tracked profiles — honest counts of our own coverage. */
export const REGIONS: { city: string; count: number; capital: boolean }[] = [
  { city: 'Nairobi', count: 19, capital: true },
  { city: 'Mombasa', count: 0, capital: false },
  { city: 'Nakuru', count: 0, capital: false },
  { city: 'Kisumu', count: 0, capital: false },
  { city: 'Eldoret', count: 0, capital: false },
  { city: 'Malindi', count: 0, capital: false },
];

/** Ticker wire items — REAL, sourced, no sample suffixes. */
export const WIRE: WireItem[] = [
  { body: 'H1 2026 · Kenya $126M equity, \u221244.5% YoY — slowest first half since 2021', source: 'Business Daily', category: 'funding' },
  { body: 'M-KOPA · $166M Series F closed Nov 2025', source: 'PitchBook', category: 'round' },
  { body: 'Twiga Foods · entered administration Aug 17 2026 · $185.4M raised', source: 'Techpoint Africa', category: 'risk' },
  { body: 'SunCulture · $10M receivables securitisation (Sep 2026)', source: 'Dealroom', category: 'round' },
  { body: 'HoneyCoin · $4.9M seed · stablecoin rails', source: 'TechCabal', category: 'round' },
  { body: 'Flowt · pre-seed first close · Delta40, Impacc, Argidius', source: 'Disrupt Africa', category: 'round' },
  { body: 'Microsoft ADC Nairobi · closure announced', source: 'CIO Africa', category: 'ecosystem' },
  { body: 'Africa H1 2026 · $1.44B, +1.34% — concentration, not collapse', source: 'TechCabal Insights', category: 'funding' },
  { body: 'Investor losses · Sh93bn across 13 startup failures', source: 'Business Daily', category: 'risk' },
  { body: 'Kenya 2025 · $984M equity — Africa #1, second year running', source: 'Tech In Africa', category: 'funding' },
  { body: 'DevFest Nairobi 2026 · Nov 13\u201314 (GDG Nairobi)', source: 'GDG Nairobi', category: 'event' },
  { body: 'Insurtech · Sh8.54B venture funding over five years', source: 'Business Daily', category: 'funding' },
];
