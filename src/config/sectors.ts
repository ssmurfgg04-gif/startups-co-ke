/** Sector palette + labels — global design config. */

export const SECTOR_COLORS: Record<string, string> = {
  Fintech: '#0E4630',
  Commerce: '#B4530A',
  Logistics: '#4A4636',
  Agritech: '#4F7A28',
  Energy: '#B87503',
  Health: '#A63D2F',
  Edtech: '#1F5F5B',
  Proptech: '#6B4A2B',
  SaaS: '#3E4A3A',
  'HR & Future of Work': '#7C6A00',
  Media: '#33312A',
  Other: '#6E6A5B',
};

export const SECTORS = Object.keys(SECTOR_COLORS);

export const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B'] as const;

export const CITIES = ['Nairobi', 'Mombasa', 'Nakuru', 'Kisumu', 'Eldoret', 'Malindi', 'Nanyuki'] as const;

export function sectorColor(sector: string): string {
  return SECTOR_COLORS[sector] ?? SECTOR_COLORS.Other;
}
