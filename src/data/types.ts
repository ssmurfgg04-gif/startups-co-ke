/**
 * DATA TYPES — real, sourced Kenyan ecosystem entities.
 * Honesty system (docs/DECISIONS.md D2): every figure carries a status
 * (Confirmed / Reported / Estimated) and, where one exists, a named source.
 * Failure states (administration / liquidation / shutdown / restructuring)
 * are tracked like funding states — never hidden.
 */

export type Stage =
  | 'Pre-seed'
  | 'Seed'
  | 'Series A'
  | 'Pre-Series A'
  | 'Series B'
  | 'Series C'
  | 'Series F'
  | 'Mature'
  | '—';

export type RoundStatus = 'Confirmed' | 'Reported' | 'Estimated';

export type CompanyStatus =
  | 'Active'
  | 'In administration'
  | 'In liquidation'
  | 'Shut down'
  | 'Restructuring';

export interface FundingRound {
  /** ISO date or 'YYYY-MM' when day unknown; '' when not public */
  date: string;
  round: string;
  /** USD millions; null when undisclosed */
  amount: number | null;
  lead: string;
  status?: RoundStatus;
  source?: string;
}

export interface Company {
  id: string;
  name: string;
  tagline: string;
  sector: string;
  stage: Stage;
  hq: string;
  founded: number;
  /** USD millions, total disclosed funding; null when not tracked */
  raised: number | null;
  employees: number | string;
  /** profile cross-checked against >=2 independent public sources as of 2026-10-15 */
  verified: 0 | 1;
  techStack: string[];
  longDesc: string;
  /** sourced milestones & signals (each carries its source inline) */
  signals: string[];
  rounds: FundingRound[];
  founders: { name: string; role: string }[];
  /** operational status — failure states are tracked, not hidden */
  status?: CompanyStatus;
  statusNote?: string;
  website?: string | null;
  /** domain for favicon/logo lookup */
  domain?: string | null;
  /** display string e.g. "$241M · 22 rounds" */
  raisedDisplay?: string;
  raisedSource?: string | null;
  /** /logos/{id}.png when fetched; null -> monogram tile fallback */
  logo?: string | null;
  featured?: boolean;
  views?: number; // seeded, for "Most viewed" sort
}

export interface Investor {
  id: string;
  name: string;
  type: string;
  hq: string;
  stages: string[];
  cheque: string;
  thesis: string;
  thesisPills: string[];
  deals: number;
  verified: 0 | 1;
  note: string;
  portfolio: string[]; // company ids
  focusSectors: string[];
  website?: string | null;
  logo?: string | null;
  /** first verified Kenya involvement, where a public date exists */
  activeSince?: number;
  /** verified co-investors on the tracked rounds (D2) */
  coInvestors?: string[];
  /** board-only? investor known via rounds but no profile page */
  viaRoundOnly?: boolean;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  location: string;
  mode: 'Hybrid' | 'On-site' | 'Remote';
  category: 'Engineering' | 'Data' | 'Product' | 'Design' | 'Growth' | 'Operations' | 'Executive';
  /** display string; market bands are labelled as bands, not offers */
  salary: string;
  salaryMin: number; // KSh / month, for benchmark bars
  salaryMax: number;
  postedDays: number;
  featured: boolean;
  tags: string[];
  description: string;
  /** careers page / board where the role was seen */
  applyUrl?: string | null;
  /** how we know the role exists (board name + date) */
  source?: string;
}

export interface Hackathon {
  id: string;
  title: string;
  focus: string;
  city: string;
  mode: 'On-site' | 'Hybrid' | 'Online';
  prize: string;
  /** absolute start/end in EAT — preferred for real events */
  startISO?: string;
  endISO?: string;
  /** countdown target as offset from "now" at view time (fallback) */
  startOffsetMs?: number;
  endOffsetMs?: number;
  dateLabel?: string; // for past / TBA events
  theme?: string;
  tracks?: string[];
  organizers?: string;
  url?: string | null;
  kind?: string;
  builders?: number;
  verifiedOrganizer?: boolean;
  featured?: boolean;
  ongoing?: boolean;
  status?: 'upcoming' | 'ongoing' | 'past';
  notes?: string;
  days?: number; // days remaining for upcoming chips
}

export interface PastWinner {
  event: string;
  team: string;
  prize: string;
  outcome: string;
}

export interface Report {
  id: string;
  title: string;
  pages: number;
  date: string;
  blurb: string;
  price: 'Members' | 'Free' | string;
  tags: string[];
  flagship?: boolean;
}

export interface RoundItem {
  id: string;
  companyId: string;
  date: string;
  round: string;
  /** USD millions; null when undisclosed */
  amount: number | null;
  lead: string;
  status: RoundStatus;
  source: string;
  note?: string;
}

export interface SalaryBand {
  role: string;
  min: number; // KSh / month
  max: number;
  source?: string;
}

export interface TrendItem {
  keyword: string;
  volume: string;
}

export interface WireItem {
  body: string;
  source: string;
  category: 'funding' | 'round' | 'risk' | 'ecosystem' | 'event' | 'consumer';
}

/**
 * County row — coordinates/capital are objective; `hub` appears only when a
 * named public source verified the anchor (D2). Counties without a hub are
 * shown as geography, never as activity.
 */
export interface County {
  id: string;
  name: string;
  capital: string;
  lon: number;
  lat: number;
  hub?: { name: string; kind: string; source: string };
}

/**
 * Live job row, normalised from employer ATS boards at build time.
 * No salary is invented: salary fields are null and the UI says so.
 */
export interface LiveJob {
  id: string;
  title: string;
  companyId: string;
  location: string;
  mode: 'Hybrid' | 'On-site' | 'Remote' | '—';
  category: 'Engineering' | 'Data' | 'Product' | 'Design' | 'Growth' | 'Operations' | 'Executive' | 'Other';
  postedDays: number | null;
  applyUrl: string;
  /** board name, e.g. "Lever" / "Ashby" */
  board: string;
  tags: string[];
}
