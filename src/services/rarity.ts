import type { Rarity } from '@/types/domain';
import { airportById, typeById, registrationByReg } from '@/data/catalog';

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'special'];

export const rarityLabel: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  special: 'Special Edition',
};

/**
 * Frequency → rarity thresholds (share of movements at an airport over a
 * rolling 90-day window). In production the frequencies come from licensed
 * movement data aggregated nightly; in demo mode from catalog.typeFrequency.
 */
export const RARITY_THRESHOLDS: { min: number; rarity: Rarity }[] = [
  { min: 0.02, rarity: 'common' },
  { min: 0.005, rarity: 'uncommon' },
  { min: 0.001, rarity: 'rare' },
  { min: 0.0003, rarity: 'epic' },
  { min: 0, rarity: 'legendary' },
];

export function rarityFromFrequency(freq: number | undefined, fallback: Rarity): Rarity {
  if (freq === undefined) return fallback;
  for (const t of RARITY_THRESHOLDS) if (freq >= t.min) return t.rarity;
  return 'legendary';
}

/** Rarity of an aircraft type at a given airport. Special liveries override. */
export function localRarity(typeId: string, airportId?: string, registration?: string): Rarity {
  const reg = registration ? registrationByReg[registration] : undefined;
  if (reg?.specialLivery) return 'special';
  const t = typeById[typeId];
  const base = t?.baseRarity ?? 'common';
  if (!airportId) return base;
  const ap = airportById[airportId];
  if (!ap) return base;
  // Historic / military types aren't in movement data — use base rarity.
  if (t && (t.category === 'historic' || t.category === 'military')) return base;
  const freq = ap.typeFrequency[typeId];
  // A type never recorded at this airport is at least "epic" locally.
  if (freq === undefined) return RARITY_ORDER.indexOf(base) < 3 ? 'epic' : base;
  return rarityFromFrequency(freq, base);
}

export function rarityRank(r: Rarity) {
  return RARITY_ORDER.indexOf(r);
}
