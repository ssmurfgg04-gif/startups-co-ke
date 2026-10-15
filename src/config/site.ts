/**
 * GLOBAL SITE CONFIG — single source of truth for chrome, contact, nav, SEO.
 * Change here, propagates everywhere (masthead, footer, SEO, JSON-LD, toasts).
 */

export const SITE = {
  name: 'startups.co.ke',
  title: "startups.co.ke — Kenya's Startup Ecosystem & Business Intelligence Hub",
  description:
    'Verified startup profiles, funding data, an investor directory, hackathons and tech jobs across Kenya — the intelligence layer for the Kenyan startup ecosystem.',
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
      { label: 'About & sample-data notice', modal: 'about' },
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
    note: 'All prices are illustrative samples.',
  },
  jobPostPricing: [
    { tier: 'Featured', price: 'KSh 25,000' },
    { tier: 'Standard', price: 'KSh 12,000' },
    { tier: 'Internship', price: 'KSh 6,000' },
  ],
  investorSub: { price: 'KSh 4,900/mo', trial: '14-day trial' },
};

export const HONESTY = {
  disclaimer:
    'Every company, investor, person, figure, article and event on this site is an illustrative sample describing no real entity or transaction. “Verified” describes our fictional registry-plus-team-check design, labelled as such throughout.',
  chips: {
    sample: 'Sample data',
    sampleProfile: 'Sample profile',
    illustrative: 'Illustrative',
    samplePricing: 'Sample pricing',
    sampleEvent: 'Illustrative event — not a real listing',
    sampleContent: 'Sample content',
    unverifiedAmount: 'Unverified — sample data',
  },
};
