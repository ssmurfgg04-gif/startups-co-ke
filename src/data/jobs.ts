import type { Job } from './types';

/**
 * REAL roles seen live on employer boards / vetted job boards, as of 2026-10-15.
 * Salary figures are MARKET BANDS (CareerBuddy Jun 2026 · Mctaba Jun 2026 · WageIndicator 2026),
 * labelled as bands — not the employer's offer. Each entry carries its source.
 */
export const JOBS: Job[] = [
  {
    id: 'j-mkopa-backend',
    title: 'Senior Backend Engineer — Asset Finance',
    companyId: 'm-kopa',
    location: 'Nairobi',
    mode: 'Hybrid',
    category: 'Engineering',
    salary: 'KSh 350–500K · market band',
    salaryMin: 350,
    salaryMax: 500,
    postedDays: 3,
    featured: true,
    tags: ['Go/Java', 'M-PESA rails', 'Payments at scale'],
    description:
      'Own payment orchestration services that move millions of daily micro-repayments across Kenya, Nigeria, Ghana and India. You will harden reconciliation between M-PESA, Airtel Money and card rails, and cut failure rates on the 2G/USSD edge. Title confirmed live on M-KOPA\u2019s careers board.',
    applyUrl: 'https://www.m-kopa.com/careers',
    source: 'M-KOPA careers board (Oct 2026)',
  },
  {
    id: 'j-mkopa-pm',
    title: 'Senior Product Manager — Mobility',
    companyId: 'm-kopa',
    location: 'Nairobi',
    mode: 'Hybrid',
    category: 'Product',
    salary: 'KSh 300–450K · market band',
    salaryMin: 300,
    salaryMax: 450,
    postedDays: 5,
    featured: false,
    tags: ['EV transition', 'Hardware + software', '0→1 products'],
    description:
      'Pioneer the product side of M-KOPA\u2019s electric mobility expansion — financing structures for e-motorbikes and service networks. Listed via jobs board; confirm live status on the careers page.',
    applyUrl: 'https://www.m-kopa.com/careers',
    source: 'Jobs board (Blue Haven), Oct 2026',
  },
  {
    id: 'j-mkopa-qa',
    title: 'Quality Assurance & Training Analyst',
    companyId: 'm-kopa',
    location: 'Nairobi',
    mode: 'Hybrid',
    category: 'Operations',
    salary: 'KSh 150–250K · market band',
    salaryMin: 150,
    salaryMax: 250,
    postedDays: 9,
    featured: false,
    tags: ['QA', 'Training design'],
    description:
      'Build QA frameworks and training programmes across customer operations. Title confirmed live on the Ashby board; confirm on the careers page before applying.',
    applyUrl: 'https://www.m-kopa.com/careers',
    source: 'Ashby board (Oct 2026)',
  },
  {
    id: 'j-sunculture-field',
    title: 'Sales and Service Center Associate',
    companyId: 'sunculture',
    location: 'Nairobi',
    mode: 'On-site',
    category: 'Operations',
    salary: 'KSh 60–120K · market band',
    salaryMin: 60,
    salaryMax: 120,
    postedDays: 6,
    featured: false,
    tags: ['Farmer sales', 'Service centres', 'PAYG'],
    description:
      'Run the front line of SunCulture\u2019s farmer network — demonstrations, sales and after-sales service from a regional service centre. Listed on Fuzu with an application window of roughly two weeks at time of indexing.',
    applyUrl: 'https://sunculture.com/careers/',
    source: 'Fuzu board (Oct 2026)',
  },
  {
    id: 'j-sunculture-telesales',
    title: 'Telesales Agent',
    companyId: 'sunculture',
    location: 'Nairobi',
    mode: 'Hybrid',
    category: 'Growth',
    salary: 'KSh 40–90K · market band',
    salaryMin: 40,
    salaryMax: 90,
    postedDays: 11,
    featured: false,
    tags: ['Outbound sales', 'Farmer pipeline'],
    description:
      'Convert inbound and outbound farmer interest into irrigation-system purchases — qualifying leads, explaining PAYG terms and handing off to field teams. Seen on Fuzu; confirm on SunCulture\u2019s openings page.',
    applyUrl: 'https://sunculture.com/careers/',
    source: 'Fuzu board (Oct 2026)',
  },
  {
    id: 'j-basigo-attendant',
    title: 'Charging Station Attendant',
    companyId: 'basigo',
    location: 'Nairobi',
    mode: 'On-site',
    category: 'Operations',
    salary: 'KSh 60–120K · market band',
    salaryMin: 60,
    salaryMax: 120,
    postedDays: 14,
    featured: false,
    tags: ['EV charging', 'Safety procedures'],
    description:
      'Operate and monitor DC charging stations on BasiGo\u2019s Nairobi network — safety checks, uptime logs and driver support. Sourced via ClimateTechList; confirm live status on basi-go.com.',
    applyUrl: 'https://www.basi-go.com',
    source: 'ClimateTechList (Oct 2026)',
  },
  {
    id: 'j-pula-field',
    title: 'Field Coordinator — Kenya',
    companyId: 'pula',
    location: 'Nairobi',
    mode: 'Hybrid',
    category: 'Operations',
    salary: 'KSh 120–220K · market band',
    salaryMin: 120,
    salaryMax: 220,
    postedDays: 8,
    featured: false,
    tags: ['Agri programmes', 'Field ops', 'Insurance'],
    description:
      'Coordinate Pula\u2019s agricultural-insurance field programmes — farmer recruitment, data collection and partner agronomist liaison. Requires a BSc in project management, agricultural economics or agribusiness (per the listing). Confirm live status on Pula\u2019s careers page.',
    applyUrl: 'https://www.pula-advisors.com/careers',
    source: 'Pula careers board (Oct 2026)',
  },
  {
    id: 'j-mkopa-retail',
    title: 'Retail Customer Experience Agent — Mobility',
    companyId: 'm-kopa',
    location: 'Nairobi',
    mode: 'On-site',
    category: 'Operations',
    salary: 'KSh 60–120K · market band',
    salaryMin: 60,
    salaryMax: 120,
    postedDays: 27,
    featured: false,
    tags: ['Customer ops', 'Technical product knowledge'],
    description:
      'Serve as the technical and product knowledge anchor at one of M-KOPA\u2019s retail touchpoints for the mobility line. Title confirmed on external board (Sep 2026); confirm on the careers page.',
    applyUrl: 'https://www.m-kopa.com/careers',
    source: 'External board (Sep 2026)',
  },
];

export const JOB_CATEGORIES = ['All', 'Engineering', 'Data', 'Product', 'Design', 'Growth', 'Operations', 'Executive', 'Other'];

/**
 * LIVE LAYER — roles pulled from employers' own ATS boards at build time by
 * scripts/fetch_jobs.mjs. No salary is invented for live rows (market bands
 * exist only for the curated rows above). Kenya-relevance is enforced in the
 * pipeline; fetchedAt + per-source status land on the page.
 */
import liveRaw from './jobs.live.json';
import type { LiveJob, Company } from './types';
import { BOARD_EMPLOYERS } from './boardEmployers';
import { companyById } from './companies';

export const LIVE = liveRaw as {
  fetchedAt: string;
  note: string;
  sources: { id: string; company: string; board: string; count: number; kept: number; ok: boolean; error?: string; note?: string }[];
  jobs: LiveJob[];
};

export interface EmployerRef extends Pick<Company, 'id' | 'name' | 'sector' | 'hq' | 'domain' | 'website'> {
  logo?: string | null;
  verified?: 0 | 1;
  status?: Company['status'];
  boardOnly?: boolean;
}

/** Resolve a jobs-board employer: tracked profile first, board-only record second. */
export function employerById(id: string): EmployerRef | null {
  const c = companyById(id);
  if (c) return { id: c.id, name: c.name, sector: c.sector, hq: c.hq, domain: c.domain ?? null, website: c.website ?? null, logo: c.logo ?? null, verified: c.verified, status: c.status };
  const b = BOARD_EMPLOYERS[id];
  if (b) return { ...b, logo: null, verified: 0 };
  return null;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\b(—|-)\b/g, ' ').trim();

/** Curated + live, deduped on company+title similarity (curated rows win). */
export function allJobs(): (Job | LiveJob)[] {
  const seen = new Set(JOBS.map((j) => `${j.companyId}::${norm(j.title)}`));
  const fresh = LIVE.jobs.filter((j) => !seen.has(`${j.companyId}::${norm(j.title)}`));
  return [...JOBS, ...fresh];
}

export const isLive = (j: Job | LiveJob): j is LiveJob => !('salary' in j);
