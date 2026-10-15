import { COMPANIES } from '@/data/companies';
import { INVESTORS } from '@/data/investors';
import { JOBS } from '@/data/jobs';
import { HACKATHONS } from '@/data/hackathons';

/** Build-time search index consumed by the masthead search. */
export const GET = () => {
  const items = [
    ...COMPANIES.map((c) => ({ t: c.name, k: 'Companies', u: `/startups/${c.id}`, s: c.sector })),
    ...INVESTORS.map((i) => ({ t: i.name, k: 'Investors', u: '/investors', s: i.type })),
    ...JOBS.map((j) => ({ t: j.title, k: 'Jobs', u: '/jobs', s: j.location })),
    ...HACKATHONS.filter((h) => !h.ongoing).map((h) => ({ t: h.title, k: 'Hackathons', u: '/hackathons', s: h.city })),
    { t: 'Funding database', k: 'Go-to', u: '/funding' },
    { t: 'Research library', k: 'Go-to', u: '/research' },
    { t: 'The Wire (news)', k: 'Go-to', u: '/news' },
    { t: 'Privacy policy', k: 'Go-to', u: '/privacy' },
  ];
  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
  });
};

export const prerender = true;
