/**
 * THE ECOSYSTEM BRIEF — current edition draft, fact-checked 2026-10-19.
 *
 * This module is the draft the /desk Brief panel pre-fills. It lives in git
 * so every claim and its provenance are auditable. Counts marked [DB] are
 * checked against production data at fact-check time; if the underlying
 * data changes materially, update this module before sending.
 *
 * FACT-CHECK PROVENANCE (verified 2026-10-19):
 * - SunCulture $10M receivables securitisation, Sep 2026, with Mirova
 *   (Gigaton Fund) senior secured financing to an SPV acquiring receivables
 *   originated by SunCulture Kenya:
 *   https://www.africaprivateequitynews.com/p/sunculture-closes-10m-solar-irrigation
 *   https://weetracker.com/2026/09/27/sunculture-10m-securitisation-solar-irrigation
 *   https://app.dealroom.co/news/note/sunculture-raises-10m-in-solar-irrigation-securitisation
 *   (The earlier draft called it "the second structure of its kind"; that
 *   ranking could not be sourced, so it was replaced with the one claim we
 *   CAN source: Sun King's $156M Kenyan solar securitisation, July 2025,
 *   https://www.citigroup.com/global/news/press-release/2025/citi-sun-king-securitization-deliver-solar-million-kenyans)
 * - Flowt pre-seed first close, investors Delta40 Fund I, Impacc, Argidius
 *   Foundation, amount undisclosed, Aug 2026:
 *   https://disruptafrica.com/2026/08/26/kenyan-ai-startup-flowt-raises-pre-seed-funding-round
 *   https://www.finsmes.com/2026/08/flowt-raises-pre-seed-funding.html
 * - Kenya 2025: $965M total, $582M debt (60%) vs $383M equity —
 *   Africa: The Big Deal, "2025 in review": https://thebigdeal.substack.com/p/2025ir2
 *   (The earlier draft's 2026 debt-vs-equity generalisation was based on a
 *   two-round tracked sample and was removed as over-reach.)
 * - 21 tracked company profiles, every figure source-tagged: production
 *   index (src/data/companies.ts), 21/21 with named sources. [DB]
 * - Jobs: 29 open roles = 22 pulled live from employer ATS boards + 7
 *   curated, including the first employer-submitted listing (Gstar,
 *   packaging, Nairobi). [DB, src/data/jobs.live.json + src/data/jobs.ts]
 *   Link checks run at every refresh (GitHub Actions, daily); confirmed-dead
 *   listings drop automatically (scripts/fetch_jobs.mjs, last pull checked
 *   24, dropped 2).
 * - Senebiclabs: Nairobi / Health / Pre-seed, founder-submitted and live at
 *   /startups/community/senebiclabs; description matches senebiclabs.com
 *   ("data infrastructure for medical AI: clinician-led evaluation...").
 *   Location and stage are founder-reported, hence the listing tag.
 */

export const BRIEF = {
  id: '001',
  updatedAt: '2026-10-19',
  from: 'startups.co.ke <notices@startups.co.ke>',
  subject: 'The Ecosystem Brief #001: SunCulture banks $10M, Flowt closes, and the community board opens',
  body: `Kenya's startup week, kept short and sourced. Every figure below names where it came from. If a number has no source, it does not ship.

WHAT MOVED

1) SunCulture securitised $10M of customer receivables (September 2026). The deal: Mirova's Gigaton Fund provides $10M of senior secured financing to a vehicle that buys payment streams from SunCulture Kenya's pay-as-you-go solar irrigation customers. It says lenders now trust the repayment data coming out of pay-as-you-go solar; Sun King ran the largest earlier Kenyan structure of this kind, a $156M securitisation in July 2025. Sources: Africa Private Equity News and Dealroom, Sep 2026; Citi, Jul 2025.

2) Flowt, a Nairobi startup using AI to judge whether climate-smart small businesses can repay working capital, closed the first close of its pre-seed round from Delta40 Fund I, Impacc and the Argidius Foundation (August 2026). No amount was disclosed, and we will not invent one. Sources: Disrupt Africa and FinSMEs, Aug 2026.

3) Debt keeps doing the heavy lifting. In 2025 Kenyan startups raised about $965M, and 60% of it ($582M) was debt rather than priced equity. Source: Africa: The Big Deal, "2025 in review". For 2026 the picture is still forming; the two rounds we have tracked so far (SunCulture's securitisation, Flowt's pre-seed) fit the pattern, but a two-round sample is not a trend.

FROM THE COMMUNITY

Senebiclabs (Nairobi, Health, Pre-seed) is the first founder-submitted listing on the community board: data infrastructure for medical AI, clinician-led evaluation and high-quality clinical data. Listed by the founder, live at:
https://startups.co.ke/startups/community/senebiclabs

The jobs board is carrying 29 open roles: 22 pulled live from employer ATS boards plus 7 curated, including the first employer-submitted listing (Gstar, packaging roles, Nairobi). Application links are checked at every refresh, which runs daily; confirmed-dead listings drop automatically.
https://startups.co.ke/jobs

ONE NUMBER

21 verified company profiles, each figure on each profile names its source. Coverage is deepest in climate and energy:
https://startups.co.ke/climate-tech

THE HONEST PART

This is the first edition. It is short on purpose. We would rather earn the second open than fill the first one. Tell us what you want tracked via the contact page; the data is compiled in the open and the methodology is public:
https://startups.co.ke/methodology

You are receiving this because you subscribed at startups.co.ke. Unsubscribe any time with one click, no questions asked. The link is at the bottom of this email.

--
startups.co.ke - Kenya's startup record, kept in the open`,
};

/**
 * The exact footer appended per recipient at send time (and shown in the
 * desk preview). The unsubscribe link is HMAC-tokenised per address, so a
 * genuine one-click unsubscribe exists before we ever promised one.
 */
export function briefFooter(env, email, token) {
  const link = `https://startups.co.ke/api/unsubscribe?e=${encodeURIComponent(String(email).toLowerCase())}&t=${token}`;
  return [
    '————————————————',
    `You are receiving this because you subscribed at startups.co.ke.`,
    `Unsubscribe in one click, no questions asked:`,
    link,
  ].join('\n');
}

export function briefHeaders(env, email, token) {
  const link = `https://startups.co.ke/api/unsubscribe?e=${encodeURIComponent(String(email).toLowerCase())}&t=${token}`;
  return {
    'List-Unsubscribe': `<${link}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}
