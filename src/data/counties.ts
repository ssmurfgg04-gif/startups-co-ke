import type { County } from './types';

/**
 * ALL 47 KENYAN COUNTIES — coordinates and capitals are objective facts.
 * Ecosystem anchors (hubs, programmes) appear ONLY where verified against a
 * named public source (D2 honesty system): counties without a verified anchor
 * carry `hub: undefined` and are shown as geography, not as activity.
 * Compiled as of 2026-10-16.
 */
export const COUNTIES: County[] = [
  // — former Coast —
  { id: 'mombasa', name: 'Mombasa', capital: 'Mombasa', lon: 39.66, lat: -4.05, hub: { name: 'Swahilipot Hub (fka SwahiliBox)', kind: 'Community hub', source: 'qz.com' } },
  { id: 'kwale', name: 'Kwale', capital: 'Kwale', lon: 39.45, lat: -4.18 },
  { id: 'kilifi', name: 'Kilifi', capital: 'Kilifi', lon: 39.85, lat: -3.63 },
  { id: 'tana-river', name: 'Tana River', capital: 'Hola', lon: 39.87, lat: -1.49 },
  { id: 'lamu', name: 'Lamu', capital: 'Lamu', lon: 40.9, lat: -2.27 },
  { id: 'taita-taveta', name: 'Taita Taveta', capital: 'Voi', lon: 38.56, lat: -3.39 },
  // — North Eastern —
  { id: 'garissa', name: 'Garissa', capital: 'Garissa', lon: 39.65, lat: -0.45, hub: { name: 'NieHub — Northern Innovation & Empowerment Hub', kind: 'DigiKen hub (UN 2025)', source: 'UNESCO (Feb 2025)' } },
  { id: 'wajir', name: 'Wajir', capital: 'Wajir', lon: 40.06, lat: 1.75 },
  { id: 'mandera', name: 'Mandera', capital: 'Mandera', lon: 41.86, lat: 3.94 },
  // — Eastern —
  { id: 'marsabit', name: 'Marsabit', capital: 'Marsabit', lon: 37.99, lat: 2.33 },
  { id: 'isiolo', name: 'Isiolo', capital: 'Isiolo', lon: 37.58, lat: 0.35 },
  { id: 'meru', name: 'Meru', capital: 'Meru', lon: 37.65, lat: 0.05 },
  { id: 'tharaka-nithi', name: 'Tharaka Nithi', capital: 'Chuka', lon: 37.65, lat: -0.3 },
  { id: 'embu', name: 'Embu', capital: 'Embu', lon: 37.45, lat: -0.53 },
  { id: 'kitui', name: 'Kitui', capital: 'Kitui', lon: 38.01, lat: -1.37 },
  { id: 'machakos', name: 'Machakos', capital: 'Machakos', lon: 37.27, lat: -1.52 },
  { id: 'makueni', name: 'Makueni', capital: 'Wote', lon: 37.62, lat: -1.8 },
  // — Central —
  { id: 'nyandarua', name: 'Nyandarua', capital: 'Ol Kalou', lon: 36.38, lat: -0.17 },
  { id: 'nyeri', name: 'Nyeri', capital: 'Nyeri', lon: 36.95, lat: -0.42, hub: { name: 'Othaya NGCDF AYEC + Mt Kenya Hub catchment', kind: 'DigiKen hub (UN 2025)', source: 'UNESCO (Feb 2025) · UNDP' } },
  { id: 'kirinyaga', name: 'Kirinyaga', capital: 'Kerugoya', lon: 37.31, lat: -0.5 },
  { id: 'muranga', name: "Murang'a", capital: "Murang'a", lon: 37.15, lat: -0.72 },
  { id: 'kiambu', name: 'Kiambu', capital: 'Kiambu', lon: 36.83, lat: -1.17 },
  // — Rift Valley —
  { id: 'turkana', name: 'Turkana', capital: 'Lodwar', lon: 35.61, lat: 3.12 },
  { id: 'west-pokot', name: 'West Pokot', capital: 'Kapenguria', lon: 35.11, lat: 1.6 },
  { id: 'samburu', name: 'Samburu', capital: 'Maralal', lon: 37.0, lat: 1.29 },
  { id: 'trans-nzoia', name: 'Trans Nzoia', capital: 'Kitale', lon: 34.95, lat: 1.02 },
  { id: 'uasin-gishu', name: 'Uasin Gishu', capital: 'Eldoret', lon: 35.27, lat: 0.52, hub: { name: 'EldoHub + Dlab Hub', kind: 'Training + innovation hubs', source: 'UNDP County Profiles · qz.com' } },
  { id: 'elgeyo-marakwet', name: 'Elgeyo Marakwet', capital: 'Iten', lon: 35.53, lat: 0.98 },
  { id: 'nandi', name: 'Nandi', capital: 'Kapsabet', lon: 35.1, lat: 0.1 },
  { id: 'baringo', name: 'Baringo', capital: 'Kabarnet', lon: 35.97, lat: 0.47 },
  { id: 'laikipia', name: 'Laikipia', capital: 'Nanyuki', lon: 36.78, lat: 0.23 },
  { id: 'nakuru', name: 'Nakuru', capital: 'Nakuru', lon: 36.07, lat: -0.3, hub: { name: 'Africa Tech Space (ATS)', kind: 'Innovation hub', source: 'hub listing (2026)' } },
  { id: 'narok', name: 'Narok', capital: 'Narok', lon: 35.87, lat: -1.09 },
  { id: 'kajiado', name: 'Kajiado', capital: 'Kajiado', lon: 36.78, lat: -1.85 },
  { id: 'kericho', name: 'Kericho', capital: 'Kericho', lon: 35.28, lat: -0.37 },
  { id: 'bomet', name: 'Bomet', capital: 'Bomet', lon: 35.34, lat: -0.78 },
  // — Western —
  { id: 'kakamega', name: 'Kakamega', capital: 'Kakamega', lon: 34.75, lat: 0.28 },
  { id: 'vihiga', name: 'Vihiga', capital: 'Vihiga', lon: 34.72, lat: 0.05 },
  { id: 'bungoma', name: 'Bungoma', capital: 'Bungoma', lon: 34.56, lat: 0.57 },
  { id: 'busia', name: 'Busia', capital: 'Busia', lon: 34.11, lat: 0.46 },
  // — Nyanza —
  { id: 'siaya', name: 'Siaya', capital: 'Siaya', lon: 34.29, lat: 0.06 },
  { id: 'homa-bay', name: 'Homa Bay', capital: 'Homa Bay', lon: 34.46, lat: -0.53 },
  { id: 'migori', name: 'Migori', capital: 'Migori', lon: 34.47, lat: -1.06 },
  { id: 'kisumu', name: 'Kisumu', capital: 'Kisumu', lon: 34.77, lat: -0.09, hub: { name: 'LakeHub', kind: 'Innovation hub (est. 2013)', source: 'AfriLabs · qz.com' } },
  { id: 'nyamira', name: 'Nyamira', capital: 'Nyamira', lon: 34.93, lat: -0.57 },
  { id: 'kisii', name: 'Kisii', capital: 'Kisii', lon: 34.78, lat: -0.68 },
  // — Nairobi —
  { id: 'nairobi', name: 'Nairobi', capital: 'Nairobi', lon: 36.82, lat: -1.29, hub: { name: 'iHub, Antler Nairobi, Villgro Kenya +', kind: 'Densest hub cluster', source: 'site directory' } },
];

/** Counties with verified ecosystem anchors. */
export const ANCHORED_COUNTIES = COUNTIES.filter((c) => c.hub);

export const countyById = (id: string) => COUNTIES.find((c) => c.id === id);
