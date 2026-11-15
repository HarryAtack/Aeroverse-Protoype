import type { CollectedAircraft, OwnedCard, XpTransaction } from '@/types/domain';
import { ago } from '@/data/posts';

/** Starting hangar for the demo@aeroverse.app test account. */
export const demoCollection: CollectedAircraft[] = [
  { id: 'h1', typeId: 'b737-800', registration: 'G-DRTA', airlineId: 'ls', airportId: 'EGCC', firstSeen: ago(900), sightings: 14, photoId: 'b738jet2', verification: 'community_verified', rarity: 'common', bestPhotoScore: 0.82 },
  { id: 'h2', typeId: 'a320neo', registration: 'G-UZHM', airlineId: 'u2', airportId: 'EGCC', firstSeen: ago(860), sightings: 9, photoId: 'a320ezy', verification: 'registration_identified', rarity: 'common', bestPhotoScore: 0.77 },
  { id: 'h3', typeId: 'a380-800', registration: 'A6-EED', airlineId: 'ek', airportId: 'EGCC', firstSeen: ago(700), sightings: 6, photoId: 'a380', verification: 'community_verified', rarity: 'common', bestPhotoScore: 0.93 },
  { id: 'h4', typeId: 'b787-9', registration: 'G-VAHH', airlineId: 'vs', airportId: 'EGLL', firstSeen: ago(640), sightings: 2, photoId: 'b789vs', verification: 'registration_identified', rarity: 'common', bestPhotoScore: 0.8 },
  { id: 'h5', typeId: 'concorde', registration: 'G-BOAC', airlineId: 'ba', airportId: 'EGCC', firstSeen: ago(600), sightings: 3, photoId: 'concorde', verification: 'community_verified', rarity: 'legendary', bestPhotoScore: 0.88 },
  { id: 'h6', typeId: 'b747-8f', registration: 'LX-VCG', airlineId: 'cv', airportId: 'EGCC', firstSeen: ago(500), sightings: 1, photoId: 'b748f', verification: 'community_verified', rarity: 'rare', bestPhotoScore: 0.74 },
  { id: 'h7', typeId: 'atr72-600', registration: 'G-LMTE', airlineId: 'lm', airportId: 'EGCC', firstSeen: ago(420), sightings: 4, photoId: 'atr72', verification: 'variant_identified', rarity: 'uncommon', bestPhotoScore: 0.69 },
  { id: 'h8', typeId: 'e190', registration: 'PH-EZM', airlineId: 'wa', airportId: 'EHAM', firstSeen: ago(380), sightings: 2, photoId: 'e190', verification: 'registration_identified', rarity: 'common', bestPhotoScore: 0.71 },
  { id: 'h9', typeId: 'b777-300er', registration: 'A6-ENI', airlineId: 'ek', airportId: 'EGCC', firstSeen: ago(300), sightings: 5, photoId: 'b77wek', verification: 'registration_identified', rarity: 'common', bestPhotoScore: 0.79 },
  { id: 'h10', typeId: 'b757-200', registration: 'TF-FIU', airlineId: 'fi', airportId: 'EGCC', firstSeen: ago(200), sightings: 1, photoId: 'special', verification: 'community_verified', rarity: 'special', bestPhotoScore: 0.9, specialLivery: true },
  { id: 'h11', typeId: 'b737-800', registration: 'EI-DWG', airlineId: 'fr', airportId: 'EGCC', firstSeen: ago(150), sightings: 7, photoId: 'b738fr', verification: 'registration_identified', rarity: 'common', bestPhotoScore: 0.66 },
  { id: 'h12', typeId: 'typhoon', registration: 'ZJ914', airlineId: 'raf', airportId: 'EGBB', firstSeen: ago(120), sightings: 1, photoId: 'typhoon', verification: 'community_verified', rarity: 'rare', bestPhotoScore: 0.85 },
  { id: 'h13', typeId: 'a350-900', registration: 'A7-ALY', airlineId: 'qr', airportId: 'EGLL', firstSeen: ago(60), sightings: 1, photoId: 'a350qr', verification: 'type_identified', rarity: 'uncommon', bestPhotoScore: 0.72 },
  { id: 'h14', typeId: 'lancaster', registration: 'PA474', airlineId: 'bbmf', airportId: 'EGCC', firstSeen: ago(30), sightings: 1, photoId: 'lancaster', verification: 'community_verified', rarity: 'epic', bestPhotoScore: 0.91 },
];

export const demoCards: OwnedCard[] = [
  { cardId: 'cd1', count: 1, acquiredAt: ago(500) },
  { cardId: 'cd5', count: 3, acquiredAt: ago(480) },
  { cardId: 'cd7', count: 2, acquiredAt: ago(470) },
  { cardId: 'cd9', count: 2, acquiredAt: ago(400) },
  { cardId: 'cd10', count: 4, acquiredAt: ago(390) },
  { cardId: 'cd11', count: 1, acquiredAt: ago(300) },
  { cardId: 'cd14', count: 1, acquiredAt: ago(250) },
  { cardId: 'cd15', count: 1, acquiredAt: ago(240) },
  { cardId: 'cd17', count: 1, acquiredAt: ago(200) },
  { cardId: 'cd21', count: 1, acquiredAt: ago(120) },
  { cardId: 'cd24', count: 1, acquiredAt: ago(80) },
  { cardId: 'cd4', count: 1, acquiredAt: ago(40) },
];

export const demoXp: XpTransaction[] = [
  { id: 'x0', amount: 6200, reason: 'Imported history (demo)', createdAt: ago(1000) },
  { id: 'x1', amount: 400, reason: 'Legendary sighting · Concorde G-BOAC', createdAt: ago(600) },
  { id: 'x2', amount: 250, reason: 'Special livery · TF-FIU', createdAt: ago(200) },
  { id: 'x3', amount: 150, reason: 'New family · Lancaster', createdAt: ago(30) },
  { id: 'x4', amount: 120, reason: 'Challenge · Morning Rush', createdAt: ago(10) },
];
