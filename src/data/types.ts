export type Stage = 'Pre-seed' | 'Seed' | 'Series A' | 'Series B';
export type RoundStatus = 'Confirmed' | 'Reported' | 'Estimated';

export interface FundingRound {
  date: string; // ISO
  round: Stage | 'Grant' | 'Debt';
  amount: number; // USD millions
  lead: string;
}

export interface Company {
  id: string;
  name: string;
  tagline: string;
  sector: string;
  stage: Stage;
  hq: string;
  founded: number;
  raised: number; // USD millions, total
  employees: number;
  verified: 0 | 1;
  techStack: string[];
  longDesc: string;
  signals: string[];
  rounds: FundingRound[];
  founders: { name: string; role: string }[];
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
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  location: string;
  mode: 'Hybrid' | 'On-site' | 'Remote';
  category: 'Engineering' | 'Data' | 'Product' | 'Design' | 'Growth' | 'Operations' | 'Executive';
  salary: string;
  salaryMin: number; // KSh thousands / month, for benchmark bars
  salaryMax: number;
  postedDays: number;
  featured: boolean;
  tags: string[];
  description: string;
}

export interface Hackathon {
  id: string;
  title: string;
  focus: string;
  city: string;
  mode: 'On-site' | 'Hybrid' | 'Online';
  prize: string;
  /** countdown target as offset from "now" at view time (keeps countdowns live) */
  startOffsetMs?: number;
  endOffsetMs?: number;
  dateLabel?: string; // for past / fixed-date events
  theme?: string;
  tracks?: string[];
  organizers?: string;
  builders?: number;
  verifiedOrganizer?: boolean;
  featured?: boolean;
  ongoing?: boolean;
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
  amount: number; // USD millions
  lead: string;
  status: RoundStatus;
  source: string;
}

export interface SalaryBand {
  role: string;
  min: number; // KSh thousands / month
  max: number;
}

export interface DealflowItem {
  founder: string;
  company: string;
  stage: string;
  ask: string;
  note: string;
}
