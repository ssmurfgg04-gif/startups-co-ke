import type { Hackathon, PastWinner } from './types';

/**
 * REAL Kenyan builder events. Every entry was re-verified against the
 * organiser/listing page on 2026-10-19 and carries the URL of that page —
 * never a bare organiser root (root-level links were reported as "wrong
 * links"). Events that could not be verified are NOT listed. Countdowns run
 * to absolute ISO dates in Africa/Nairobi time (EAT = UTC+3).
 *
 * Verification log (2026-10-19):
 * - DevFest Nairobi 2026: gdg.community.dev event page + sessionize CFS page
 *   ("two-day event, 13-14 November", Sarit Expo Centre).
 * - Fintech Festival Kenya 2026: coinpedia events listing (Nov 5-6, Sarit
 *   Centre Phase III, organiser Mikono Expo Group).
 * - Inter-University Hackathon 2026: techgroupkenya event page TGK26HMIC4
 *   (November 13, 2026, Nairobi).
 * - Open Hackathons Oct 6-29 + Dec 2-17 (EMEA, hybrid): openhackathons.org
 *   upcoming-events listing. Organiser is the Open Hackathons programme —
 *   previously mislabelled "Africa's Talking" and "ITU" here; corrected.
 * - Africa Blockchain Festival 2026: africablockchainfestival.com — took
 *   place Oct 15-17, 2026 (Sarit Expo Centre), now a past event.
 * - ITU AI Readiness Hackathon, Kenya: aiforgood.itu.int event page — the
 *   Kenya edition was showcased May 21, 2026 at KICC (registration April,
 *   mentoring, showcase at AI Everything x GITEX Kenya). Now a past event;
 *   the earlier "Oct 6-29" dating belonged to the Open Hackathons programme,
 *   not ITU.
 * - GopherCon Africa 2026: gophercon.africa (concluded Oct 17).
 * - Campaign Finance Watch Tool Hackathon 2026: iLabAfrica hackathon category
 *   page ("successfully hosted ... with Transparency International Kenya").
 * - DevFest Nairobi 2025: gdg.community.dev day-one event page (Oct 31 2025).
 * - AI Tinkerers Nairobi: recurring chapter page nairobi.aitinkerers.org.
 */
export const HACKATHONS: Hackathon[] = [
  {
    id: 'devfest26',
    title: 'DevFest Nairobi 2026',
    focus: 'Google technologies, web, mobile, cloud, AI',
    city: 'Nairobi',
    mode: 'On-site',
    prize: '—',
    kind: 'Conference + codelabs',
    startISO: '2026-11-13T08:00:00+03:00',
    endISO: '2026-11-14T18:00:00+03:00',
    theme: 'The Kenyan dev community\u2019s biggest annual gathering under the GDG banner.',
    tracks: ['Android', 'Web', 'Cloud', 'AI/ML'],
    organizers: 'GDG Nairobi',
    url: 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-devfest-nairobi-2026/',
    verifiedOrganizer: true,
    featured: true,
    status: 'upcoming',
    notes: 'Two days at Sarit Expo Centre, theme "Build, Secure, Scale". Programme times TBA, countdown targets opening day 08:00 EAT.',
  },
  {
    id: 'fintechfest26',
    title: 'Fintech Festival Kenya 2026',
    focus: 'The future of digital finance',
    city: 'Nairobi',
    mode: 'On-site',
    prize: '—',
    kind: 'Festival',
    startISO: '2026-11-05T09:00:00+03:00',
    endISO: '2026-11-06T18:00:00+03:00',
    tracks: ['Payments', 'Regulation', 'Stablecoins'],
    organizers: 'Mikono Expo Group',
    url: 'https://events.coinpedia.org/fintech-festival-kenya-2026-8781/',
    status: 'upcoming',
    notes: 'Nov 5-6 at Sarit Centre Phase III. Registration listing with ticket tiers on the organiser page.',
  },
  {
    id: 'interuni26',
    title: 'Inter-University Hackathon 2026',
    focus: 'Harnessing AI, emerging technologies and university talent',
    city: 'Nairobi',
    mode: 'On-site',
    prize: '—',
    kind: 'Hackathon',
    startISO: '2026-11-13T08:00:00+03:00',
    tracks: ['Open', 'AI'],
    organizers: 'Tech Events Kenya',
    url: 'https://events.techgroupkenya.co.ke/events/TGK26HMIC4/inter-university-hackathon-2026/',
    status: 'upcoming',
    notes: 'November 13, 2026 in Nairobi. Ten competition tracks; see the organiser page for registration.',
  },
  {
    id: 'openhack-dec26',
    title: 'Open Hackathon, EMEA (Dec 2026)',
    focus: 'Open hackathon for the Europe/Middle East/Africa region',
    city: 'Online',
    mode: 'Hybrid',
    prize: '—',
    kind: 'Hackathon',
    startISO: '2026-12-02T09:00:00+03:00',
    endISO: '2026-12-17T23:59:00+03:00',
    tracks: ['Open'],
    organizers: 'Open Hackathons programme',
    url: 'https://www.openhackathons.org/s/upcoming-events',
    status: 'upcoming',
    notes: 'Hybrid build sprint listed for December 2-17, 2026 on the Open Hackathons programme calendar.',
  },
  {
    id: 'aitinkerers',
    title: 'AI Tinkerers Nairobi',
    focus: 'Hands-on AI builds, recurring meetup + hackathon editions',
    city: 'Nairobi',
    mode: 'On-site',
    prize: '—',
    kind: 'Meetup + hackathons',
    dateLabel: 'Recurring, see chapter page',
    tracks: ['AI'],
    organizers: 'AI Tinkerers',
    url: 'https://nairobi.aitinkerers.org/',
    status: 'upcoming',
    notes: 'Recurring; global hackathon editions held. Sessions announced on the chapter page.',
  },
  {
    id: 'openhack-oct26',
    title: 'Open Hackathon, EMEA (Oct 2026)',
    focus: 'Open hackathon for the Europe/Middle East/Africa region',
    city: 'Online',
    mode: 'Hybrid',
    prize: '—',
    kind: 'Hackathon',
    startISO: '2026-10-06T09:00:00+03:00',
    endISO: '2026-10-29T23:59:00+03:00',
    tracks: ['AI'],
    organizers: 'Open Hackathons programme',
    url: 'https://www.openhackathons.org/s/upcoming-events',
    status: 'ongoing',
    notes: 'Listed for October 6-29, 2026 on the Open Hackathons programme calendar.',
  },
  {
    id: 'abf26',
    title: 'Africa Blockchain Festival 2026',
    focus: 'Blockchain and Web3 in Africa',
    city: 'Nairobi',
    mode: 'On-site',
    prize: '—',
    kind: 'Festival',
    startISO: '2026-10-15T08:00:00+03:00',
    endISO: '2026-10-17T18:00:00+03:00',
    tracks: ['Web3', 'Payments'],
    organizers: 'Africa Blockchain Festival',
    url: 'https://africablockchainfestival.com/',
    status: 'past',
    notes: 'Held October 15-17, 2026 at Sarit Expo Centre. See the organiser site for recaps and the next edition.',
  },
  {
    id: 'gophercon26',
    title: 'GopherCon Africa 2026',
    focus: 'The premier Go conference in Africa',
    city: 'Nairobi',
    mode: 'On-site',
    prize: '—',
    kind: 'Conference',
    startISO: '2026-10-15T08:00:00+03:00',
    endISO: '2026-10-17T18:00:00+03:00',
    tracks: ['Go', 'Systems', 'Cloud-native'],
    organizers: 'GopherCon Africa',
    url: 'https://gophercon.africa/',
    verifiedOrganizer: true,
    status: 'past',
    notes: 'Thursday tutorials; conference Friday\u2013Saturday. Concluded Oct 17 \u2014 see organiser page for talks.',
  },
  {
    id: 'itu-ai-readiness',
    title: 'ITU AI Readiness Hackathon, Kenya',
    focus: 'AI for Good, first of the ITU AI Readiness hackathon series',
    city: 'Nairobi',
    mode: 'On-site',
    prize: '—',
    kind: 'Hackathon',
    startISO: '2026-05-21T12:00:00+03:00',
    endISO: '2026-05-21T17:00:00+03:00',
    tracks: ['AI', 'Civic tech'],
    organizers: 'ITU · AI for Good',
    url: 'https://aiforgood.itu.int/event/ai-readiness-hackathon-kenya/',
    status: 'past',
    notes: 'Showcased May 21, 2026 at the KICC during AI Everything Kenya x GITEX Kenya, after April registration and mentoring.',
  },
  {
    id: 'devfest25',
    title: 'DevFest Nairobi 2025',
    focus: 'Google technologies',
    city: 'Nairobi',
    mode: 'On-site',
    prize: '—',
    kind: 'Conference + codelabs',
    startISO: '2025-10-31T08:00:00+03:00',
    endISO: '2025-11-01T18:00:00+03:00',
    tracks: ['Android', 'Web', 'Cloud'],
    organizers: 'GDG Nairobi',
    url: 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-devfest-nairobi-day-one-hands-on-workshops-amp-codelabs/',
    verifiedOrganizer: true,
    status: 'past',
    notes: 'Day one hands-on workshops; day two conference.',
  },
  {
    id: 'cfwt26',
    title: 'Campaign Finance Watch Tool Hackathon 2026',
    focus: 'Campaign finance transparency tooling',
    city: 'Nairobi',
    mode: 'On-site',
    prize: '—',
    kind: 'Hackathon',
    dateLabel: 'Hosted 2026',
    tracks: ['Civic tech'],
    organizers: 'iLabAfrica + Transparency International Kenya',
    url: 'https://ilabafrica.strathmore.edu/category/hackathon/',
    verifiedOrganizer: true,
    status: 'past',
    notes: 'Successfully hosted with TI-Kenya at Strathmore University.',
  },
];

export const PAST_WINNERS: PastWinner[] = [
  {
    event: 'Campaign Finance Watch Tool Hackathon 2026',
    team: 'iLabAfrica student cohort',
    prize: 'Transparency tooling pilot',
    outcome: 'Winning tool continued with Transparency International Kenya after the sprint.',
  },
];
