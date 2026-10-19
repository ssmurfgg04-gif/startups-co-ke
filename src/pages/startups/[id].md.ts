import type { APIRoute, GetStaticPaths } from 'astro';
import { COMPANIES } from '@/data/companies';
import type { Company } from '@/data/types';

export const prerender = true;

/**
 * /startups/<id>.md, LLM-readable markdown for every tracked profile
 * (the TrustMRR "AI-readable Markdown" pattern, native to the build).
 * Linked from each profile page; llms.txt advertises the convention.
 */
export const getStaticPaths: GetStaticPaths = () =>
  COMPANIES.map((c) => ({ params: { id: c.id }, props: { company: c } }));

export const GET: APIRoute = ({ props }) => {
  const c = props.company as Company;
  const L: string[] = [];
  L.push(`# ${c.name}`);
  L.push('');
  L.push(`> ${c.tagline}`);
  L.push('');
  L.push(`- Profile: https://startups.co.ke/startups/${c.id}`);
  L.push(`- Sector: ${c.sector} · Stage: ${c.stage} · HQ: ${c.hq}${c.founded ? ` · Founded: ${c.founded}` : ''}`);
  L.push(`- Raised: ${c.raisedDisplay ?? (c.raised != null ? `$${c.raised}M` : 'not disclosed')}${c.raisedSource ? `, source: ${c.raisedSource}` : ''}`);
  L.push(`- Status: ${c.verified ? 'Verified, cross-checked against >=2 independent public sources' : 'Unverified'} · Operating: ${c.status}`);
  if (c.website) L.push(`- Website: ${c.website}`);
  if (c.employees) L.push(`- Employees: ${c.employees}`);
  if (c.founders?.length) L.push(`- Founders: ${c.founders.map((f) => `${f.name} (${f.role})`).join(', ')}`);
  if (c.longDesc) {
    L.push('');
    L.push(c.longDesc);
  }
  if (c.rounds?.length) {
    L.push('');
    L.push('## Rounds');
    for (const r of c.rounds) {
      L.push(`- ${r.date || 'date unavailable'} · ${r.round} · ${r.amount != null ? `$${r.amount}M` : 'amount n/d'} · lead: ${r.lead || '—'} · ${r.status} · source: ${r.source}`);
    }
  }
  if (c.signals?.length) {
    L.push('');
    L.push('## Signals');
    for (const s of c.signals) L.push(`- ${s}`);
  }
  L.push('');
  L.push('---');
  L.push(`Compiled from public sources by startups.co.ke, every figure carries a status and a named source. Spotted an error? Report it: https://startups.co.ke/contact`);
  L.push('');
  return new Response(L.join('\n'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
