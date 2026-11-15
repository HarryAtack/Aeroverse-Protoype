import type { CollectedAircraft, Rarity } from '@/types/domain';
import { typeById } from '@/data/catalog';

/**
 * XP rules. Designed to reward discovery, quality and verified contributions —
 * not raw upload volume. Repeat sightings earn small, capped amounts and only
 * when they add value (e.g. a better photo).
 */
export const XP_RULES = {
  firstVariant: 100,
  newFamily: 150,
  newManufacturer: 250,
  newAirline: 60,
  newRegistration: 40,
  verifiedPhoto: 50,
  firstAirportVisit: 120,
  improvedPhoto: 15,
  repeatSighting: 5,
  dailyRepeatCap: 3,
  rarityBonus: { common: 0, uncommon: 20, rare: 60, epic: 150, legendary: 400, special: 250 } as Record<Rarity, number>,
};

export interface XpLine { label: string; amount: number }

export function levelFromXp(xp: number) {
  // Smooth curve: level n requires 400 * n^1.35 cumulative XP.
  let level = 1;
  while (400 * Math.pow(level, 1.35) <= xp) level++;
  const prev = level === 1 ? 0 : 400 * Math.pow(level - 1, 1.35);
  const next = 400 * Math.pow(level, 1.35);
  return { level, current: xp - prev, needed: next - prev, progress: (xp - prev) / (next - prev) };
}

export function computeSightingXp(args: {
  collection: CollectedAircraft[];
  typeId: string;
  airlineId: string;
  registration?: string;
  airportId: string;
  rarity: Rarity;
  verified: boolean;
  photoScore: number;
  visitedAirports: string[];
  repeatsToday: number;
}): XpLine[] {
  const { collection, typeId, airlineId, registration, airportId, rarity, verified, photoScore, visitedAirports, repeatsToday } = args;
  const t = typeById[typeId];
  const lines: XpLine[] = [];
  const hasVariant = collection.some((c) => c.typeId === typeId);
  const hasFamily = t && collection.some((c) => typeById[c.typeId]?.family === t.family);
  const hasMfr = t && collection.some((c) => typeById[c.typeId]?.manufacturerId === t.manufacturerId);
  const hasAirline = collection.some((c) => c.airlineId === airlineId);
  const existingReg = registration ? collection.find((c) => c.registration === registration) : undefined;

  if (!hasMfr) lines.push({ label: 'New manufacturer', amount: XP_RULES.newManufacturer });
  if (!hasFamily) lines.push({ label: 'New aircraft family', amount: XP_RULES.newFamily });
  if (!hasVariant) lines.push({ label: 'First sighting of variant', amount: XP_RULES.firstVariant });
  if (!hasAirline) lines.push({ label: 'New airline / operator', amount: XP_RULES.newAirline });
  if (registration && !existingReg) lines.push({ label: 'New registration', amount: XP_RULES.newRegistration });
  if (!visitedAirports.includes(airportId)) lines.push({ label: 'First visit to this airport', amount: XP_RULES.firstAirportVisit });

  const isRepeat = hasVariant && (!registration || !!existingReg);
  if (isRepeat) {
    if (existingReg && photoScore > existingReg.bestPhotoScore) lines.push({ label: 'Improved photo of this aircraft', amount: XP_RULES.improvedPhoto });
    else if (repeatsToday < XP_RULES.dailyRepeatCap) lines.push({ label: 'Repeat sighting', amount: XP_RULES.repeatSighting });
    else lines.push({ label: 'Repeat sighting (daily cap reached)', amount: 0 });
  } else if (XP_RULES.rarityBonus[rarity]) {
    lines.push({ label: `Local rarity bonus`, amount: XP_RULES.rarityBonus[rarity] });
  }
  if (verified) lines.push({ label: 'Verified photo', amount: XP_RULES.verifiedPhoto });
  return lines;
}
