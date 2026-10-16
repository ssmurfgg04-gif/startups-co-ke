/**
 * VLM review — session 5 round: rebuilt founder modal, enriched post-a-job,
 * new about/contact/methodology pages, nav dropdowns, deduped homepage.
 * Usage: npx tsx scripts/vlm_review_s5.ts
 * Writes qa/vlm/s5-*.md
 */
import ZAI from 'z-ai-web-dev-sdk';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const OUT = 'qa/vlm';

const ROUNDS = [
  { name: 's5r-founder-modal', file: 'qa/vlm/s5/03-founder-modal.png', brief: 'Recheck round. "Submit your startup" modal: 2-col grid, website URL + 47-county select, custom dashed drag-drop logo zone, sentence-case helper with info icon, quiet underlined Cancel + single amber CTA with arrow, bordered X close. Judge vs last round: close-button craft, CTA hierarchy, dropzone feel, grid rhythm. Score /10.' },
  { name: 's5r-postjob-modal', file: 'qa/vlm/s5/04-postjob-modal.png', brief: 'Recheck round. "Post a job" modal now groups Pay as a 3-col fieldset (Disclosure | Min KSh | Max KSh), duties + qualifications textareas, how-to-apply method + destination + deadline fieldset, never-pay pledge + pricing ledger. Judge: field grouping scannability, spacing, Kenyan-market credibility. Score /10.' },
];

const SYSTEM = `You are a ruthless, detail-oriented senior product designer + front-end reviewer (taste protocol: minimalist-ui, anti-cliché).
You review screenshots of a Kenya startup-intelligence site whose brand is "data terminal × editorial publication": paper #F6F3EA bg, ink #181712, green #0E4630, amber #B87503, Fraunces display serif, IBM Plex Mono labels, hairline rules, offset shadows, square corners.
The owner's brief this round: forms must feel enterprise-grade yet human (custom dropzones, quiet cancels, sentence-case helper text); new trust pages (about/contact/methodology) must read like a small Nairobi desk wrote them; homepage must lead with search + timely intelligence with zero duplicated stat blocks. For the given page: (1) List concrete visual DEFECTS you can actually see — cite section names. (2) List TOP 3 highest-impact fixes with exact CSS/layout guidance. (3) Score /10 for human-crafted credibility. Be specific and terse. No generic praise.`;

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
    const md = res.choices[0]?.message?.content ?? '(no content)';
    writeFileSync(`${OUT}/${r.name}.md`, `# ${r.name}\n\n${md}\n`);
    console.log(`✓ ${r.name} — ${md.split('\n').find((l) => /score/i.test(l))?.trim().slice(0, 90) || 'done'}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
