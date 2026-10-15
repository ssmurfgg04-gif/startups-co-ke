/**
 * GLOBAL SITE CONFIG — single source of truth for chrome, contact, nav, SEO.
 * Change here, propagates everywhere (masthead, footer, SEO, JSON-LD, toasts).
 */

export const SITE = {
  name: 'startups.co.ke',
  title: "startups.co.ke — Kenya's startups, tracked properly",
  description:
    'Verified profiles for Kenyan startups — what they raised, from whom, with named sources. Investor directory, live tech jobs and every hackathon in the region.',
  url: 'https://startups.co.ke',
  locale: 'en_KE',
  themeColor: '#0E4630',
  contact: {
    email: 'jack@startups.co.ke',
    phone: '+254721725958',
    phoneDisplay: '+254 721 725 958',
    city: 'Nairobi, Kenya',
    address: 'Riverside Drive, Westlands, Nairobi, Kenya',
  },
  social: {
    x: 'https://x.com/startupscoke',
    linkedin: 'https://www.linkedin.com/company/startupscoke',
    whatsapp: 'https://whatsapp.com/channel/startupscoke',
  },
  nav: [
    { label: 'Startups', href: '/startups' },
    { label: 'Investors', href: '/investors' },
    { label: 'Funding', href: '/funding' },
    { label: 'Hackathons', href: '/hackathons' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'News', href: '/news' },
    { label: 'Research', href: '/research' },
  ],
  footer: {
    platform: [
      { label: 'Company index', href: '/startups' },
      { label: 'Investor directory', href: '/investors' },
      { label: 'Funding database', href: '/funding' },
      { label: 'Hackathon index', href: '/hackathons' },
      { label: 'Tech jobs', href: '/jobs' },
    ],
    intelligence: [
      { label: 'The Wire (news)', href: '/news' },
      { label: 'Research library', href: '/research' },
      { label: 'Methodology & statuses', modal: 'methodology' },
      { label: 'Ecosystem brief', modal: 'newsletter' },
    ],
    company: [
      { label: 'About & methodology', modal: 'about' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Post a job', modal: 'postjob' },
      { label: 'Advertise & sponsor', modal: 'sponsor' },
    ],
  },
  pricing: {
    tiers: [
      {
        id: 'explorer',
        name: 'Explorer',
        price: 'KSh 0',
        per: 'forever',
        tag: null as string | null,
        dark: false,
        features: ['Public company directory', 'Basic job board access', 'Weekly ecosystem brief', 'Hackathon calendar'],
        cta: { label: 'Start free', modal: null as string | null, href: '/startups' },
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 'KSh 2,900',
        per: '/month',
        tag: 'Most popular' as string | null,
        dark: true,
        features: [
          'Full verified company data',
          'Investor directory access',
          '2 deal-flow requests / month',
          'Salary benchmarks',
          'Funding & hiring alerts',
        ],
        cta: { label: 'Start 14-day trial', modal: 'trial', href: null as string | null },
      },
      {
        id: 'institution',
        name: 'Institution',
        price: 'KSh 24,500',
        per: '/month',
        tag: null,
        dark: false,
        features: ['API access', 'Custom research', 'Unlimited introductions', 'Dedicated analyst'],
        cta: { label: 'Talk to us', modal: 'sponsor', href: null },
      },
    ],
    note: 'Invoice or M-PESA — no card needed. Free tier is free, no card, no trial clock.'
  },
  jobPostPricing: [
    { tier: 'Free listing', price: 'KSh 0', note: 'Human-reviewed in ~48h · live 14 days' },
    { tier: 'Standard', price: 'KSh 2,900', note: 'Live 30 days · in job alerts + WhatsApp channel' },
    { tier: 'Featured', price: 'KSh 6,500', note: 'Pinned top of board + homepage slot · 45 days' },
  ],
  jobPostPack: 'Hiring more than one? 3 posts for KSh 7,500 — reply to the confirmation email.',
  jobPostPledge:
    'Applicants never pay to apply — ever. Every listing is reviewed by a person before it goes live, so no “M-PESA registration fee” scams on this board.',
  investorSub: { price: 'KSh 4,900/mo', trial: '14-day trial' },
};

/**
 * Honesty system (docs/DECISIONS.md D2): real, sourced data with visible
 * statuses. `Verified` = profile cross-checked against >=2 independent public
 * sources as of 2026-10-15. Figures are Confirmed / Reported / Estimated, each
 * with a named source. Failure states are tracked, not hidden.
 */
export const HONESTY = {
  disclaimer:
    'Compiled from public sources as of Oct 15, 2026. Every figure carries a status — Confirmed, Reported or Estimated — and a named source. “Verified” means a profile was cross-checked against at least two independent public sources. Failure states (administration, liquidation, shutdown) are tracked like funding states. Spotted an error? “Report an issue” on any profile.',
  chips: {
    verified: 'Verified',
    unverified: 'Unverified',
    confirmed: 'Confirmed',
    reported: 'Reported',
    estimated: 'Estimated',
    marketBand: 'Market band — not an offer',
    tba: 'Dates TBA',
    asOf: 'As of Oct 15, 2026',
    notTracked: 'Not tracked',
  },
};
