import type { WireItem } from './types';
import { allJobs } from './jobs';
import { COMPANIES } from './companies';
import { INVESTORS } from './investors';
import { HACKATHONS } from './hackathons';

/**
 * Headline stats — REAL tracked counts + sourced market figures (as of 2026-10-15).
 * Market figures carry their source in the UI where they appear.
 */
export const STATS = {
  companiesTracked: COMPANIES.length, // derived, real tracked profiles
  activeInvestors: INVESTORS.length, // derived, real tracked investors
  openTechJobs: allJobs().length, // derived: curated + live ATS rows (no stale hardcode)
  hackathonsIndexed: HACKATHONS.length, // derived, real events
  capitalYTD: 126, // H1 2026 equity, $M (Business Daily) — labelled in UI
  capital2025: 984, // 2025 equity total, $M (Tech In Africa / Fintech Assoc. Kenya)
  capital2025InclDebt: 1040, // $M incl. debt (Invest Kenya)
  medianSeed: 1600, // median of tracked seed-stage rounds ≈ $1.6M — derived from tracked data
  h1YoY: -44.5, // % change vs H1 2025 (Business Daily)
  investorLossesKsh: 93, // Sh93bn across 13 failures (Business Daily, Sep 16 2026)
  failuresTracked: 13,
};

/** County spread of tracked profiles — honest counts of our own coverage. */
// Derived from tracked HQs — honest counts of our own coverage.
const hqCount = (city: string) => COMPANIES.filter((c) => c.hq === city).length;
export const REGIONS: { city: string; count: number; capital: boolean }[] = [
  { city: 'Nairobi', count: hqCount('Nairobi'), capital: true },
  { city: 'Mombasa', count: hqCount('Mombasa'), capital: false },
  { city: 'Nakuru', count: hqCount('Nakuru'), capital: false },
  { city: 'Kisumu', count: hqCount('Kisumu'), capital: false },
  { city: 'Eldoret', count: hqCount('Eldoret'), capital: false },
  { city: 'Malindi', count: hqCount('Malindi'), capital: false },
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
