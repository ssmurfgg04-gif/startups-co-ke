/**
 * GLOBAL SITE CONFIG, single source of truth for chrome, contact, nav, SEO.
 * Change here, propagates everywhere (masthead, footer, SEO, JSON-LD, toasts).
 */

export const SITE = {
  name: 'startups.co.ke',
  title: "startups.co.ke: Kenya's startups, tracked properly",
  description:
    'Verified profiles for Kenyan startups: what they raised, from whom, with named sources. Investor directory, live tech jobs and every hackathon in the region.',
  url: 'https://startups.co.ke',
  locale: 'en_KE',
  themeColor: '#0E4630',
  contact: {
    email: 'jack@startups.co.ke',
    /** Base64 of the desk email, anchors carry data-email (never the literal
     *  address) so Cloudflare's Email Obfuscation has nothing to rewrite and
     *  stops injecting its render-blocking email-decode script. core.ts
     *  decodes at runtime: sets the mailto href + visible text. */
    emailB64: 'amFja0BzdGFydHVwcy5jby5rZQ==',
    emailLabel: 'Email the desk',
    phone: '+254721725958',
    phoneDisplay: '+254 721 725 958',
    /** Click-to-chat deep link (digits only, no plus). Opens a chat with the desk. */
    whatsapp: 'https://wa.me/254721725958',
    city: 'Nairobi, Kenya',
    address: 'Riverside Drive, Westlands, Nairobi, Kenya',
  },
  social: {
    x: 'https://x.com/startupscoke',
    linkedin: 'https://www.linkedin.com/company/startupscoke',
    whatsapp: 'https://whatsapp.com/channel/startupscoke',
  },
  nav: [
    {
      label: 'Discover', href: '/startups',
      children: [
        { label: 'Company index', href: '/startups' },
        { label: 'Climate & Energy hub', href: '/climate-tech' },
        { label: 'Founder-listed startups', href: '/startups/community' },
        { label: 'Investor directory', href: '/investors' },
      ],
    },
    {
      label: 'Capital', href: '/funding',
      children: [
        { label: 'Funding database', href: '/funding' },
        { label: 'Investor directory', href: '/investors' },
      ],
    },
    { label: 'Careers', href: '/jobs' },
    { label: 'Events', href: '/hackathons' },
    {
      label: 'Insights', href: '/news',
      children: [
        { label: 'The Wire (news)', href: '/news' },
        { label: 'Research library', href: '/research' },
        { label: 'Methodology', href: '/methodology' },
      ],
    },
  ],
  footer: {
    platform: [
      { label: 'Company index', href: '/startups' },
      { label: 'Climate & Energy hub', href: '/climate-tech' },
      { label: 'Founder-listed startups', href: '/startups/community' },
      { label: 'Investor directory', href: '/investors' },
      { label: 'Funding database', href: '/funding' },
      { label: 'Hackathon index', href: '/hackathons' },
      { label: 'Tech jobs', href: '/jobs' },
    ],
    insights: [
      { label: 'The Wire (news)', href: '/news' },
      { label: 'Research library', href: '/research' },
      { label: 'Methodology & statuses', href: '/methodology' },
      { label: 'Ecosystem brief', modal: 'newsletter' },
      { label: 'llms.txt (AI-readable index)', href: '/llms.txt' },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Methodology', href: '/methodology' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Post a job', modal: 'postjob' },
      { label: 'Advertise & sponsor', modal: 'sponsor' },
    ],
  },
  // Everything is free while the audience grows. Paid tiers return only after
  // paid investor research is validated with real buyers (docs/DECISIONS.md).
  jobPostPricing: [
    { tier: 'Free listing', price: 'KSh 0', note: 'Human-reviewed in ~48h · live 30 days' },
  ],
  jobPostPack: 'Hiring more than one? List them all free. Reply to the confirmation email with the rest and we will add them.',
  jobPostPledge:
    'Applicants never pay to apply, ever. Every listing is reviewed by a person before it goes live, so no "M-PESA registration fee" scams on this board.',
};

/**
 * Honesty system (docs/DECISIONS.md D2): real, sourced data with visible
 * statuses. `Verified` = profile cross-checked against >=2 independent public
 * sources as of 2026-10-15. Figures are Confirmed / Reported / Estimated, each
 * with a named source. Failure states are tracked, not hidden.
 */
export const HONESTY = {
  disclaimer:
    'Compiled from public sources as of Oct 15, 2026. Every figure carries a status (Confirmed, Reported or Estimated) and a named source. "Verified" means a profile was cross-checked against at least two independent public sources. Failure states (administration, liquidation, shutdown) are tracked like funding states. Spotted an error? "Report an issue" on any profile.',
  chips: {
    verified: 'Verified',
    unverified: 'Unverified',
    confirmed: 'Confirmed',
    reported: 'Reported',
    estimated: 'Estimated',
    marketBand: 'Market band, not an offer',
    tba: 'Dates TBA',
    asOf: 'As of Oct 15, 2026',
    notTracked: 'Not tracked',
  },
};
