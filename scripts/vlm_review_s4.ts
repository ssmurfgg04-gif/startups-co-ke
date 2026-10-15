/**
 * VLM review — session 4 round: founder strip, sector index, jobs pay honesty,
 * new logo mark, postjob modal, DataPlate illustrations.
 * Usage: npx tsx scripts/vlm_review_s4.ts
 * Writes qa/vlm/s4-*.md
 */
import ZAI from 'z-ai-web-dev-sdk';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const OUT = 'qa/vlm';

const ROUNDS = [
  { name: 's4-hero-founderstrip', file: 'qa/shots/hero-strip.png', brief: 'Home hero + new founder strip below it. Judge: masthead "s." logo mark (hand-set S + amber dot) next to lowercase wordmark; founder strip ("Founder? Claim a free profile and get seen...") with two CTAs. Look for: does the strip answer "why should a founder stay" in under 3 seconds; strip spacing/crowding; wordmark legibility. Score /10.' },
  { name: 's4-insights-sector', file: 'qa/shots/insights.png', brief: 'Ecosystem insights section: left "Startups tracked by sector" dense index (7 rows, each with count bar + inline company names), right "Latest funding intelligence" (8 rounds + All rounds (20) link). Judge balance: is there still obvious empty space in either box; row rhythm; truncated company lists. Score /10.' },
  { name: 's4-jobs-pay-honesty', file: 'qa/shots/jobs-desktop.png', brief: 'Jobs page full. Judge: hero honesty block ("Only 8 of 29 roles here publish pay. That\'s Kenya... zero salary transparency"), Pay disclosed + Remote only filters, live rows with "Pay n/d · via Ashby", new Post-a-job rail (Free listing KSh 0 / Standard KSh 2,900 / Featured KSh 6,500 with per-tier notes + never-pay pledge). Look for: honesty block placement, rail crowding, filter label clarity. Score /10.' },
  { name: 's4-postjob-modal', file: 'qa/shots/postjob-modal.png', brief: 'Post-a-job modal. Judge: package select (Free/Standard/Featured), Pay (optional) select (Not disclosed/Negotiable/Range), "How should people apply?" (Email a CV / WhatsApp / Portal link), never-pay pledge line, pricing summary line. Look for: form crowding, label clarity, whether it feels Kenyan-market-aware vs generic SaaS. Score /10.' },
  { name: 's4-article-dataplate', file: 'qa/shots/article-plate.png', brief: 'Article page hero with new generative DataPlate illustration (seeded dot-field, rising envelope, amber marker, mono caption) replacing random stock photos. Judge: does it look authored/on-brand (paper/green/amber), legible caption, editorial fit with Fraunces headline. Score /10.' },
  { name: 's4-logo-mark', file: 'qa/mark_test.png', brief: 'Logo mark test sheet: new "s." favicon/mark at 16/32/64/128px + embeddable "Listed on startups.co.ke" badge + on-dark variant. Judge: distinctiveness vs generic AI geometric marks, small-size legibility, badge text spacing. Score /10.' },
  { name: 's4-home-mobile', file: 'qa/shots/home-mobile.png', brief: 'Home on mobile (390px). Judge: founder strip stacking, sector index rows, hero H1 wrap, tap target sizes. Look for: horizontal overflow, cramped strips, font legibility. Score /10.' },
];

const SYSTEM = `You are a ruthless, detail-oriented senior product designer + front-end reviewer (taste protocol: minimalist-ui, anti-cliché).
You review screenshots of a Kenya startup-intelligence site whose brand is "data terminal × editorial publication": paper #F6F3EA bg, ink #181712, green #0E4630, amber #B87503, Fraunces display serif, IBM Plex Mono labels, hairline rules, offset shadows, square corners.
The owner's brief this round: kill every trace of generic AI design (uniform card grids, verbose marketing speak, stock photos); the site must read like it was set by a small Nairobi editorial team. For the given page: (1) List concrete visual DEFECTS you can actually see — cite section names. (2) List TOP 3 highest-impact fixes with exact CSS/layout guidance. (3) Score /10 for human-crafted credibility. Be specific and terse. No generic praise.`;

async function main() {
  const zai = await ZAI.create();
  mkdirSync(OUT, { recursive: true });
  for (const r of ROUNDS) {
    const b64 = readFileSync(r.file).toString('base64');
    const res = await zai.chat.completions.createVision({
      messages: [
        { role: 'assistant', content: SYSTEM },
        { role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: `Page: ${r.name}. ${r.brief}` },
        ] as any },
      ],
      thinking: { type: 'disabled' },
    });
    const md = `# VLM review — ${r.name}\n\nFile: ${r.file}\nDate: 2026-10-16\n\n${res.choices[0]?.message?.content}\n`;
    writeFileSync(`${OUT}/${r.name}.md`, md);
    console.log(`✓ ${r.name} → ${OUT}/${r.name}.md`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
