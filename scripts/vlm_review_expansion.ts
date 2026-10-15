/**
 * VLM review — expansion round: county map + live jobs + investor track records.
 * Usage: npx tsx scripts/vlm_review_expansion.ts
 * Writes qa/vlm/expansion-*.md
 */
import ZAI from 'z-ai-web-dev-sdk';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const OUT = 'qa/vlm';

const ROUNDS = [
  { name: 'expansion-home-counties', file: 'qa/screens/home-counties.png', brief: 'Home page, map band. Judge: 47-county dot map (42 county seats + 6 green hub rings), "County anchors — verified" railbox with hub names + kind chips, sources line. Look for: dot collisions with city labels, ring/label overlap, rail row crowding, caption legibility. Score /10.' },
  { name: 'expansion-live-jobs', file: 'qa/screens/live-jobs.png', brief: 'Jobs board with LIVE rows. Judge: "● Live" green chips vs Featured amber chips, hero live strip ("35 open roles · 27 pulled live..."), Live board status railbox (11 employer boards with per-board status), "Band n/a" salary honesty on live rows. Look for: chip overload, status rail alignment, any row that looks broken. Score /10.' },
  { name: 'expansion-investors-track', file: 'qa/screens/investors-track.png', brief: 'Investor directory with expanded fund showing derived Kenya track record (round rows with status chips), tracked portfolio chips, verified co-investors. Look for: row density, chip soup, alignment of round lines, credibility of track-record block. Score /10.' },
];

const SYSTEM = `You are a ruthless, detail-oriented senior product designer + front-end reviewer (taste protocol: minimalist-ui, anti-cliché).
You review screenshots of a Kenya startup-intelligence site whose brand is "data terminal × editorial publication": paper #F6F3EA bg, ink #181712, green #0E4630, amber #B87503, Fraunces display serif, IBM Plex Mono labels, hairline rules, offset shadows, square corners.
For the given page: (1) List concrete visual DEFECTS you can actually see — cite section names. (2) List TOP 3 highest-impact fixes with exact CSS/layout guidance. (3) Score /10 for credibility to a PitchBook-reading investor. Be specific and terse. No generic praise.`;

async function main() {
  const zai = await ZAI.create();
  mkdirSync(OUT, { recursive: true });
  for (const r of ROUNDS) {
    const b64 = readFileSync(r.file).toString('base64');
    const res = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: [
          { type: 'text', text: r.brief },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
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
