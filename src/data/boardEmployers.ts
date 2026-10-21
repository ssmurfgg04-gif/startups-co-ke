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
  chaingpt: {
    id: 'chaingpt',
    name: 'ChainGPT',
    sector: 'SaaS',
    hq: 'Remote · Kenya hiring',
    domain: 'chaingpt.org',
    website: 'https://www.chaingpt.org',
    boardOnly: true,
  },
  openfn: {
    id: 'openfn',
    name: 'OpenFn',
    sector: 'SaaS',
    hq: 'Remote · Kenya hiring',
    domain: 'openfn.org',
    website: 'https://www.openfn.org',
    boardOnly: true,
  },
  fairmoney: {
    id: 'fairmoney',
    name: 'FairMoney',
    sector: 'Fintech',
    hq: 'Kenya · Nairobi office',
    domain: 'fairmoney.co',
    website: 'https://fairmoney.co',
    boardOnly: true,
  },
  ajaia: {
    id: 'ajaia',
    name: 'AJAIA',
    sector: 'SaaS',
    hq: 'Kenya',
    domain: 'ajaia.co',
    website: 'https://ajaia.co',
    boardOnly: true,
  },
  distro: {
    id: 'distro',
    name: 'Distro',
    sector: 'SaaS',
    hq: 'Kenya · Nairobi office',
    domain: 'distro.com',
    website: 'https://www.distro.com',
    boardOnly: true,
  },
};
