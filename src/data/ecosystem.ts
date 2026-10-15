import type { RoundItem, SalaryBand, DealflowItem, Report } from './types';

/** Latest tracked rounds feed (status letters: c/r/e per methodology). */
export const ROUNDS: RoundItem[] = [
  {
    id: 'r1',
    companyId: 'sokoni-systems',
    date: '2026-10-09',
    round: 'Series A',
    amount: 9.0,
    lead: 'Rift Capital Partners',
    status: 'Confirmed',
    source: 'Company statement',
  },
  {
    id: 'r2',
    companyId: 'pesaflow',
    date: '2026-10-06',
    round: 'Series A',
    amount: 12.0,
    lead: 'Hornbill Growth',
    status: 'Confirmed',
    source: 'Lead investor memo',
  },
  {
    id: 'r3',
    companyId: 'bodametrics',
    date: '2026-09-28',
    round: 'Seed',
    amount: 2.1,
    lead: 'Savannah Ventures',
    status: 'Reported',
    source: 'Founder interview',
  },
  {
    id: 'r4',
    companyId: 'mika-homes',
    date: '2026-09-21',
    round: 'Seed',
    amount: 1.6,
    lead: 'Tenda Microfund',
    status: 'Estimated',
    source: 'Registry filing',
  },
  {
    id: 'r5',
    companyId: 'mavuno-analytics',
    date: '2026-09-12',
    round: 'Grant',
    amount: 0.35,
    lead: 'Climate adaptation fund',
    status: 'Confirmed',
    source: 'Grant register',
  },
  {
    id: 'r6',
    companyId: 'dukacredit',
    date: '2026-09-02',
    round: 'Pre-seed',
    amount: 0.4,
    lead: 'Mwezi Capital',
    status: 'Reported',
    source: 'Angel syndicate note',
  },
];

/** Quarterly funding series (USD millions) — 8 quarters × series. */
export const QUARTERS = ['Q1\u201925', 'Q2\u201925', 'Q3\u201925', 'Q4\u201925', 'Q1\u201926', 'Q2\u201926', 'Q3\u201926', 'Q4\u201926'];
export const SERIES: Record<string, number[]> = {
  all: [12, 18, 15, 24, 19, 27, 31, 38],
  fintech: [5, 7, 4, 9, 6, 10, 12, 15],
  climate: [3, 5, 6, 7, 5, 8, 9, 11],
  commerce: [2, 3, 3, 5, 4, 6, 6, 7],
};

/** Startups tracked by sector (11 bars on home insights). */
export const SECTOR_COUNTS: { sector: string; count: number }[] = [
  { sector: 'Fintech', count: 96 },
  { sector: 'Commerce', count: 71 },
  { sector: 'Health', count: 54 },
  { sector: 'Agritech', count: 49 },
  { sector: 'Logistics', count: 38 },
  { sector: 'Energy', count: 34 },
  { sector: 'Edtech', count: 28 },
  { sector: 'SaaS', count: 25 },
  { sector: 'Proptech', count: 21 },
  { sector: 'HR & Future of Work', count: 18 },
  { sector: 'Other', count: 18 },
];

/** Capital mix YTD (funding page horizontal bars). */
export const CAPITAL_MIX: { label: string; pct: number }[] = [
  { label: 'Fintech', pct: 31 },
  { label: 'Energy & climate', pct: 24 },
  { label: 'Commerce & logistics', pct: 18 },
  { label: 'Health', pct: 11 },
  { label: 'Agritech', pct: 9 },
  { label: 'Everything else', pct: 7 },
];

export const SALARY_BANDS: SalaryBand[] = [
  { role: 'Backend', min: 450, max: 600 },
  { role: 'Data / ML', min: 380, max: 550 },
  { role: 'Product', min: 350, max: 450 },
  { role: 'Mobile', min: 320, max: 460 },
  { role: 'Design', min: 220, max: 300 },
  { role: 'Growth', min: 200, max: 280 },
];

export const DEALFLOW: DealflowItem[] = [
  {
    founder: 'Wanjiku N.',
    company: 'Sokoni Systems',
    stage: 'Series A',
    ask: '$9M round, $7M open',
    note: 'Wholesale commerce OS; 2,100 active wholesalers; NRR 128% (sample).',
  },
  {
    founder: 'Kevin M.',
    company: 'BodaMetrics',
    stage: 'Seed',
    ask: '$2.1M round, $600K open',
    note: '11K instrumented motorcycles; insurance distribution live (sample).',
  },
  {
    founder: 'Grace A.',
    company: 'Zuka Energy',
    stage: 'Series B',
    ask: '$12M round, closed \u2014 watchlist',
    note: '38K PAYG contracts; PAR30 at 6.8% (sample).',
  },
];

export const REPORTS: Report[] = [
  {
    id: 'state-2025',
    title: 'State of Kenya\u2019s Startup Ecosystem 2025',
    pages: 68,
    date: '2025-12-01',
    blurb: 'The flagship annual: capital flows, sector deep-dives, talent, policy and a county-level activity map.',
    price: 'KSh 4,500',
    tags: ['Flagship', 'Data appendix'],
    flagship: true,
  },
  {
    id: 'funding-h1-2025',
    title: 'Funding Landscape H1 2025',
    pages: 34,
    date: '2025-08-14',
    blurb: 'Quarter-by-quarter capital tracking, round-size distributions and lead-investor league tables.',
    price: 'Members',
    tags: ['Funding'],
  },
  {
    id: 'talent-comp',
    title: 'Talent & Compensation Guide',
    pages: 41,
    date: '2025-09-02',
    blurb: 'Salary bands across 14 roles, equity norms and the SHIF payroll transition\u2019s hiring effects.',
    price: 'KSh 2,500',
    tags: ['Talent'],
  },
  {
    id: 'payments-deepdive',
    title: 'Payments Infrastructure Deep Dive',
    pages: 52,
    date: '2025-10-20',
    blurb: 'M-PESA rails, orchestration economics, failure/retry data and where the margin actually is.',
    price: 'Members',
    tags: ['Fintech'],
  },
  {
    id: 'hackathon-impact',
    title: 'Hackathon Impact Study',
    pages: 22,
    date: '2026-01-11',
    blurb: 'What build sprints actually produce: follow-on funding, acqui-hires and county contracts.',
    price: 'Free',
    tags: ['Talent'],
  },
];
