/**
 * VLM review rounds (D7 taste loop) — vision critique of page screenshots.
 * Usage: npx tsx scripts/vlm_review.ts <rounds...|all>
 * Writes qa/vlm/<name>.md review files.
 */
import ZAI from 'z-ai-web-dev-sdk';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const DIR = 'qa/screenshots';
const OUT = 'qa/vlm';

const ROUNDS: { name: string; file: string; brief: string }[] = [
  { name: 'round-01-home', file: '01-home-full.png', brief: 'Home page full scroll. Judge: information hierarchy, hero clarity, dark/green band rhythm, stat band credibility, honesty chips placement, typography (Fraunces display vs IBM Plex Mono labels), any visual defects (overlap, clipped text, dead space, broken images).' },
  { name: 'round-02-directory', file: '02-startups-directory.png', brief: 'Startup directory. Judge: filter rail usability, card grid density, logo rendering vs monogram tiles, status chips (Verified / In administration), empty or awkward states.' },
  { name: 'round-03-profile-mkopa', file: '03-profile-mkopa.png', brief: 'M-KOPA company profile. Judge: header with logo, tabs, funding table readability, cumulative funding chart, right rail (verification, backers, hiring). Look for data mismatches, cramped cells, tab styling issues.' },
  { name: 'round-04-twiga-failure', file: '04-profile-twiga-failure.png', brief: 'Twiga Foods profile — company in administration. Judge: whether the failure status note block is prominent and dignified, monogram fallback (no logo by design), overall credibility of failure tracking.' },
  { name: 'round-05-investors', file: '05-investors.png', brief: 'Investor directory. Judge: expandable fund rows, cheque/stage chips, right rail deal-flow copy, filter rail. Look for alignment issues and chip overload.' },
  { name: 'round-06-funding', file: '06-funding.png', brief: 'Funding database (dark chart). Judge: quarterly bar chart legibility, sector switcher, rounds table with status dots, CSV export affordance, dark-band contrast.' },
  { name: 'round-07-hackathons', file: '07-hackathons.png', brief: 'Hackathons page. Judge: featured DevFest countdown (should show real days to Nov 13 2026), event grid with real dates/TBA chips, ongoing live badge, calendar. Any countdown showing zero/— or wrong layout.' },
  { name: 'round-08-jobs', file: '08-jobs.png', brief: 'Jobs board. Judge: job rows with market-band salaries, expand affordance, apply buttons pointing to employer boards, salary benchmark rail with real bands, honest counts.' },
  { name: 'round-09-article', file: '09-article-sh93bn.png', brief: 'Long-form article. Judge: editorial typography of prose, byline, sources block at end, share row, image treatment (warm monochrome). Look for over-long line lengths or weak pull-quote presence.' },
  { name: 'round-10-research', file: '10-research.png', brief: 'Research page. Judge: flagship report cover, library rows, arXiv methodology rail, Google Trends consumer pulse rail, competitor positioning note. Look for balance between rails and any table/list misalignment.' },
];

const SYSTEM = `You are a ruthless, detail-oriented senior product designer + front-end reviewer (taste protocol: minimalist-ui, anti-cliché).
You review screenshots of a Kenya startup-intelligence site whose brand is "data terminal × editorial publication": paper #F6F3EA bg, ink #181712, green #0E4630, amber #B87503, Fraunces display serif, IBM Plex Mono labels, hairline rules, offset shadows, square corners.
For the given page: (1) List concrete visual DEFECTS you can actually see (overlap, clipping, misalignment, contrast failures, broken/blurry images, crowded rows, orphaned labels, inconsistent chips, countdown issues, table issues) — cite section names. (2) List TOP 3 highest-impact fixes with exact CSS/layout guidance. (3) Score /10 for credibility to a PitchBook-reading investor.
Be specific and terse. No generic praise. If the page is clean, say so and score it honestly.`;

async function reviewOne(zai: Awaited<ReturnType<typeof ZAI.create>>, round: (typeof ROUNDS)[number]) {
  const b64 = readFileSync(`${DIR}/${round.file}`).toString('base64');
  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: SYSTEM },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          { type: 'text', text: `Page: ${round.name.replace(/^round-\d+-/, '')}. ${round.brief}` },
        ],
      },
    ],
    thinking: { type: 'disabled' },
  });
  const out = completion.choices[0]?.message?.content ?? '(empty response)';
  writeFileSync(`${OUT}/${round.name}.md`, `# ${round.name}\n\nFile: ${round.file}\n\n${out}\n`);
  console.log(`✔ ${round.name} written (${out.length} chars)`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const arg = process.argv[2] ?? 'all';
  const rounds = arg === 'all' ? ROUNDS : ROUNDS.filter((r) => r.name.includes(arg));
  const zai = await ZAI.create();
  for (const round of rounds) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await reviewOne(zai, round);
        break;
      } catch (e) {
        console.error(`✗ ${round.name} attempt ${attempt}: ${String(e).slice(0, 200)}`);
        if (attempt === 2) {
          writeFileSync(`${OUT}/${round.name}.md`, `# ${round.name}\n\nREVIEW FAILED: ${String(e)}\n`);
        } else {
          await new Promise((r) => setTimeout(r, 4000));
        }
      }
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
