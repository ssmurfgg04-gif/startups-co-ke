import type { Company } from './types';

/**
 * BOARD-ONLY EMPLOYERS, companies with verified live ATS boards that hire in
 * Kenya but are not (yet) tracked as full startup profiles. Rendered on the
 * jobs board with an honest "board-only" chip, never presented as profiles.
 */
export const BOARD_EMPLOYERS: Record<string, Pick<Company, 'id' | 'name' | 'sector' | 'hq' | 'domain' | 'website'> & { boardOnly: true }> = {
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
};
