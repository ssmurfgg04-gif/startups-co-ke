/** Headline stats (illustrative samples) + wire items for the live ticker. */
export const STATS = {
  companiesTracked: 428,
  activeInvestors: 96,
  openTechJobs: 312,
  hackathonsIndexed: 38,
  capitalYTD: 184,
  medianSeed: 420,
  roundsThisYear: 62,
  quarterNew: 31,
};

export const REGIONS: { city: string; count: number; capital: boolean }[] = [
  { city: 'Nairobi', count: 268, capital: true },
  { city: 'Mombasa', count: 41, capital: false },
  { city: 'Nakuru', count: 33, capital: false },
  { city: 'Kisumu', count: 28, capital: false },
  { city: 'Eldoret', count: 19, capital: false },
  { city: 'Malindi', count: 12, capital: false },
];

/** Ticker wire items — every one suffixed SAMPLE per the honesty system. */
export const WIRE: string[] = [
  'Sokoni Systems closes $9M Series A — Rift Capital leads [SAMPLE]',
  'Funding index +18% QoQ [SAMPLE]',
  'PesaFlow settles $184M YTD across rails [SAMPLE]',
  'BodaMetrics instruments 11,000th motorcycle [SAMPLE]',
  'Zuka Energy PAR30 improves to 6.8% [SAMPLE]',
  'Nairobi Build Week crosses 900 builders [SAMPLE]',
  'Kilele Climate Fund backs 12th climate deal [SAMPLE]',
  'Hiring: 312 open tech roles across the index [SAMPLE]',
  'Mavuno Analytics cuts post-harvest loss 23% [SAMPLE]',
  'Median seed cheque holds at $420K [SAMPLE]',
];
