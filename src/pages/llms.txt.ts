import type { APIRoute } from 'astro';
import { COMPANIES } from '@/data/companies';
import { INVESTORS } from '@/data/investors';
import { JOBS } from '@/data/jobs';
import { HACKATHONS } from '@/data/hackathons';
import { SITE } from '@/config/site';

export const prerender = true;

/**
 * /llms.txt — the llmstxt.org convention: a compact, LLM-readable map of the
 * site. Distinct from sitemap.xml (which is for crawlers); this is for
 * AI assistants that need to know what the site holds and where.
 */
export const GET: APIRoute = () => {
  const md = `# startups.co.ke

> Kenya's startup record, kept in the open. ${COMPANIES.length} Kenyan startups tracked with verified profiles — what they raised, from whom, and who failed, every figure carrying a status (Confirmed / Reported / Estimated) and a named public source. Plus an investor directory, a live tech jobs board pulled from employer boards on every build, and an index of regional hackathons.

The site is an independent, Nairobi-built directory and intelligence platform. Data is compiled from public sources; "Verified" means a profile was cross-checked against at least two independent public sources. Failure states (administration, liquidation, shutdown) are tracked like funding states.

## Main pages

- [Company index](${SITE.url}/startups): all ${COMPANIES.length} tracked startups with sector, stage, HQ, disclosed funding and per-profile sourcing
- [Climate & Energy hub](${SITE.url}/climate-tech): the climate-lens vertical — electric mobility, solar, agri-insurance and PAYG energy profiles with tagged rounds
- [Funding database](${SITE.url}/funding): every tracked round with date, amount, lead investor and status
- [Investor directory](${SITE.url}/investors): ${INVESTORS.length} active investors with track records derived from the rounds feed
- [Tech jobs](${SITE.url}/jobs): ${JOBS.length} open roles, refreshed daily from employer ATS boards
- [Hackathon index](${SITE.url}/hackathons): ${HACKATHONS.length} build events with prize pools, tracks and outcomes
- [Founder-listed startups](${SITE.url}/startups/community): directory of startups listed directly by their founders, published instantly with a Founder-submitted status tag
- [The Wire (news)](${SITE.url}/news): analysis on Kenyan capital, talent and failures — every claim sourced
- [Research library](${SITE.url}/research): flagship reports (Kenya Funding Landscape) and data appendix
- [Methodology](${SITE.url}/methodology): how data is compiled, statuses and correction process

## Machine-readable

- [Per-startup markdown](https://startups.co.ke/startups/m-kopa.md): append .md to any profile URL for the LLM-readable version
- [Founder-listed startup markdown](https://startups.co.ke/startups/community/any-slug?format=md): append ?format=md to any founder-listed profile
- [Full export](${SITE.url}/llms-full.txt): the complete tracked dataset as one markdown document
- [RSS](${SITE.url}/rss.xml): The Wire feed
`;
  return new Response(md, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
