import type { APIRoute } from 'astro';
import { COMPANIES } from '@/data/companies';
import { INVESTORS } from '@/data/investors';
import { SITE } from '@/config/site';

export const prerender = true;

/** /llms-full.txt — the complete tracked dataset as one markdown document. */
export const GET: APIRoute = () => {
  const L: string[] = [];
  L.push(`# startups.co.ke — full dataset`);
  L.push('');
  L.push(`> Complete tracked record of Kenya's startup economy as of the build date. Every figure carries a status — Confirmed, Reported or Estimated — and a named source. "Verified" = cross-checked against >=2 independent public sources. Failure states are tracked, not hidden.`);
  L.push('');
  L.push(`Compiled: ${new Date().toISOString().slice(0, 10)} · Site: ${SITE.url}`);
  L.push('');

  L.push(`## Companies (${COMPANIES.length} tracked)`);
  for (const c of COMPANIES) {
    L.push('');
    L.push(`### ${c.name} (${SITE.url}/startups/${c.id})`);
    L.push(`- Status: ${c.verified ? 'Verified (2+ public sources)' : 'Unverified'} · Operating status: ${c.status}`);
    L.push(`- Sector: ${c.sector} · Stage: ${c.stage} · HQ: ${c.hq}${c.founded ? ` · Founded: ${c.founded}` : ''}`);
    L.push(`- Tagline: ${c.tagline}`);
    L.push(`- Raised: ${c.raisedDisplay ?? (c.raised != null ? `$${c.raised}M` : 'not disclosed')}${c.raisedSource ? ` — source: ${c.raisedSource}` : ''}`);
    if (c.website) L.push(`- Website: ${c.website}`);
    if (c.employees) L.push(`- Employees: ${c.employees}`);
    if (c.founders?.length) L.push(`- Founders: ${c.founders.map((f) => `${f.name} (${f.role})`).join(', ')}`);
    if (c.longDesc) { L.push(''); L.push(c.longDesc); }
    if (c.rounds?.length) {
      L.push('');
      L.push('Rounds:');
      for (const r of c.rounds) {
        L.push(`  - ${r.date || 'date unavailable'} · ${r.round} · ${r.amount != null ? `$${r.amount}M` : 'amount n/d'} · lead: ${r.lead || '—'} · ${r.status} · source: ${r.source}`);
      }
    }
    if (c.signals?.length) {
      L.push('');
      L.push('Signals:');
      for (const s of c.signals) L.push(`  - ${s}`);
    }
  }

  L.push('');
  L.push(`## Investors (${INVESTORS.length} tracked)`);
  for (const i of INVESTORS) {
    L.push('');
    L.push(`### ${i.name}`);
    L.push(`- ${i.type ?? 'Investor'}${i.stages?.length ? ` · stages: ${i.stages.join(', ')}` : ''}${i.hq ? ` · HQ: ${i.hq}` : ''}${i.cheque ? ` · cheque: ${i.cheque}` : ''}`);
    if (i.portfolio?.length) L.push(`- Portfolio tracked: ${i.portfolio.join(', ')}`);
    if (i.note) L.push(`- Note: ${i.note}`);
  }

  L.push('');
  L.push('## Policies');
  L.push(`- Correct a figure: ${SITE.url}/contact — corrections verified against sources, usually within two working days.`);
  L.push('- Content signals (robots.txt): search=yes, ai-train=no (Cloudflare-managed signal), use=reference. Per-page markdown endpoints exist for retrieval use: any /startups/<id>.md and /startups/community/<slug>?format=md.');
  L.push('');
  return new Response(L.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
