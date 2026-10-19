import type { Company } from './types';

/**
 * BOARD-ONLY EMPLOYERS: companies that hire in Kenya but are not (yet) tracked
 * as full startup profiles. Two kinds live here:
 *  - verified live ATS boards (rendered with an honest "board-only" chip), and
 *  - employer-submitted listings ("submitted: true"), reviewed by a person,
 *    never presented as profiles and never marked verified.
 */
export const BOARD_EMPLOYERS: Record<string, Pick<Company, 'id' | 'name' | 'sector' | 'hq' | 'domain' | 'website'> & { boardOnly: true; submitted?: boolean }> = {
  moniepoint: {
    id: 'moniepoint',
    name: 'Moniepoint',
    sector: 'Fintech',
    hq: 'Lagos, Nigeria · Nairobi office',
    domain: 'moniepoint.com',
    website: 'https://moniepoint.com',
    boardOnly: true,
  },
  tala: {
    id: 'tala',
    name: 'Tala',
    sector: 'Fintech',
    hq: 'Santa Monica, US · Nairobi history',
    domain: 'tala.co',
    website: 'https://tala.co',
    boardOnly: true,
  },
  branch: {
    id: 'branch',
    name: 'Branch',
    sector: 'Fintech',
    hq: 'San Francisco, US · Nairobi office',
    domain: 'branch.co',
    website: 'https://branch.co',
    boardOnly: true,
  },
  gstar: {
    id: 'gstar',
    name: 'Gstar',
    sector: 'Other',
    hq: 'Kenya · employer-submitted',
    boardOnly: true,
    submitted: true,
  },
};
