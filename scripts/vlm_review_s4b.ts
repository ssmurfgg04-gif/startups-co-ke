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
  { name: 's4b-postjob-modal', file: 'qa/shots/postjob-modal.png', brief: 'Post-a-job modal after rebuild: square corners, 2px ink border, hard offset shadow, paper bg, mono uppercase labels, Package select (Free listing KSh 0 / Standard / Featured), Pay (optional) select, How-should-people-apply select (Email a CV / WhatsApp / Portal link), pledge line + pricing ledger line. Judge: does it now read as a custom editorial component vs generic SaaS widget. Score /10.' },
  { name: 's4b-logo-mark', file: 'qa/mark_test.png', brief: 'Rebuilt mark + badge: bolder S stroke, amber dot clear of the tail, rx12 consistent; badge is now a typeset plate (paper face, ink hairline, ink offset shadow, mono LISTED ON + serif domain + green mark tile). Judge small-size legibility (16/32px) and editorial credibility. Score /10.' },
  { name: 's4b-hero-founderstrip', file: 'qa/shots/hero-strip.png', brief: 'Home hero + founder strip after fixes: 30px mark, bold wordmark, de-crowded strip (more padding), square cookie banner with offset shadow. Judge: masthead presence, strip readability, would a founder get the value prop in 3 seconds. Score /10.' },
  { name: 's4b-insights-sector', file: 'qa/shots/insights.png', brief: 'Insights section after fixes: sector index rows with darker company names + medium-weight sector labels, funding rail capped at 8 rounds with All rounds (20) link. Judge balance and density now. Score /10.' },
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
