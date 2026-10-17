/**
 * VLM review — session 6 round: jobs page mobile rework (deterministic pay grid,
 * mobile pay strip, standardized pay columns, verified filter, vetted railbox).
 * Usage: npx tsx scripts/vlm_review_s6.ts
 * Writes qa/vlm/s6-*.md
 */
import ZAI from 'z-ai-web-dev-sdk';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const OUT = 'qa/vlm';

const ROUNDS = [
  { name: 's6-jobs-mobile-rows', file: 'qa/vlm/s6/m2-jobs-mid.png', brief: 'MOBILE 375px, jobs list rows. Previous defect (user-reported): "payment ranges floating around" — pay text used to wrap unpredictably. Fix: every collapsed row is now a deterministic grid — row 1 = logo | title+chips+meta | caret; row 2 = full-width strip under a dashed divider with pay left (KSh band + "/ mo · band" tag, or italic "pay: n/d") and date + bookmark right. Judge: is pay now anchored and consistent across rows? Any floating/wrapped pay text left? Alignment of the strip, dashed divider quality, touch-target sizes. Score /10.' },
  { name: 's6-jobs-mobile-hero', file: 'qa/vlm/s6/m5-hero.png', brief: 'MOBILE 375px, jobs page hero (dark). Search input, All Kenya select, SEARCH button, quick chips, honesty block about pay disclosure. Judge: form sizing on 375px, wrap behavior of the search row, hierarchy of the honesty block, kicker legibility. Score /10.' },
  { name: 's6-jobs-desktop-rows', file: 'qa/vlm/s6/d1-jobs-rows.png', brief: 'DESKTOP 1366px, jobs list. Rows are a 6-col grid: logo | title | pay (fixed 9.5rem right column, standardized "KSh min–max" + "market band · mo" sub-label) | date | bookmark | caret. Right rail: Live board status + "How listings are vetted" checklist with Confirmed chip. Judge: does every pay value align in the same column (ovrion-style standardized compensation)? Rail hierarchy vs the rows, vetted box scannability, filter bar (All/Engineering/… + Pay disclosed/Remote only/Verified only). Score /10.' },
  { name: 's6-jobs-mobile-expanded', file: 'qa/vlm/s6/m3-row-expanded.png', brief: 'MOBILE 375px, one job row expanded: description, tag chips, amber "Apply on employer board ↗" + "Report listing", source line. Judge: expanded content spacing on mobile, CTA reachability, tag chip wrapping, source line honesty. Score /10.' },
];

const SYSTEM = `You are a ruthless, detail-oriented senior product designer + front-end reviewer (taste protocol: minimalist-ui, anti-cliché).
You review screenshots of a Kenya startup-intelligence site whose brand is "data terminal × editorial publication": paper #F6F3EA bg, ink #181712, green #0E4630, amber #B87503, Fraunces display serif, IBM Plex Mono labels, hairline rules, offset shadows, square corners.
The owner's brief this round: on mobile the pay/salary text used to float around unpredictably — the fix must anchor pay in a consistent slot on every row; the board should feel like a trustworthy, vetted directory (verification transparency is the core differentiator). For the given page: (1) List concrete visual DEFECTS you can actually see — cite section names. (2) List TOP 3 highest-impact fixes with exact CSS/layout guidance. (3) Score /10 for human-crafted credibility. Be specific and terse. No generic praise.`;

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
    console.log(`✓ ${r.name} — ${md.split('\n').find((l) => /score/i.test(l))?.trim().slice(0, 110) || 'done'}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
