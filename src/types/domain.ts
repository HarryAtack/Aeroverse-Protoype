/**
 * Core domain model. These types mirror the PostgreSQL schema in
 * backend/supabase/migrations/0001_schema.sql so that the demo data layer
 * can be swapped for the real API without touching screens.
 */

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'special';

export type AircraftCategory = 'airliner' | 'regional' | 'cargo' | 'military' | 'historic' | 'special';

export interface PhotoAsset {
  id: string;
  /** require() module id for bundled demo images, or a remote/local URI. */
  source: number | { uri: string };
  author: string;
  license: string;
  sourceUrl?: string;
  title?: string;
  /** True for demo imagery sourced from Wikimedia Commons. */
  isDemo?: boolean;
}

export interface Manufacturer {
  id: string;
  name: string;
  country: string;
}

export interface AircraftType {
  id: string; // e.g. 'a380-800'
  manufacturerId: string;
  family: string; // e.g. 'A380'
  variant: string; // e.g. 'A380-800'
  icao: string; // ICAO type designator, e.g. 'A388'
  category: AircraftCategory;
  firstFlight: string;
  engines: string;
  seatsTypical?: string;
  rangeKm?: number;
  lengthM: number;
  wingspanM: number;
  description: string;
  photoId: string;
  baseRarity: Rarity;
  inProduction: boolean;
}

export interface Airline {
  id: string;
  name: string;
  iata: string;
  icao: string;
  country: string;
  color: string;
  military?: boolean;
}

export interface Airport {
  id: string; // ICAO
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  photoId: string;
  members: number;
  timezone: string;
  runways: string[];
  /** Flight-movement frequency per aircraft type (share of movements, 0-1) for local rarity. Demo values. */
  typeFrequency: Record<string, number>;
  spottingNote?: string;
}

export interface Registration {
  reg: string;
  typeId: string;
  airlineId: string;
  msn?: string;
  delivered?: string;
  livery?: string;
  specialLivery?: boolean;
  notes?: string;
}

export type VerificationStage =
  | 'detected'
  | 'type_identified'
  | 'variant_identified'
  | 'registration_identified'
  | 'community_verified'
  | 'needs_review'
  | 'unverified';

export interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  homeAirportId: string;
  avatarColor: [string, string];
  avatarPhotoId?: string;
  coverPhotoId?: string;
  favouriteTypeId?: string;
  level: number;
  xp: number;
  followers: number;
  following: number;
  aircraftCollected: number;
  airportsVisited: string[];
  photographer?: boolean;
  plus?: boolean;
  verifiedContributor?: boolean;
  specialties?: string[];
  isDemo: true;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  likes: number;
}

export interface Post {
  id: string;
  userId: string;
  photoId: string;
  typeId: string;
  registration?: string;
  airlineId: string;
  airportId: string;
  location: string;
  takenAt: string;
  caption: string;
  verification: VerificationStage;
  likes: number;
  comments: Comment[];
  shares: number;
  tags?: string[];
  rare?: boolean;
  military?: boolean;
  featured?: boolean;
}

export type SpotKind =
  | 'official_viewing'
  | 'observation_deck'
  | 'public_spot'
  | 'photo_position'
  | 'museum'
  | 'airshow'
  | 'community';

export type InfoStatus = 'verified' | 'community' | 'unknown';

export interface SpotInfo {
  text: string;
  status: InfoStatus;
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface SpottingLocation {
  id: string;
  name: string;
  kind: SpotKind;
  airportId?: string;
  lat: number;
  lon: number;
  verified: boolean;
  summary: string;
  photoIds: string[];
  rating: number;
  ratingCount: number;
  bestFor: string[];
  runwayVisibility: SpotInfo;
  parking: SpotInfo;
  transport: SpotInfo;
  facilities: string[];
  safety: string;
  reviews: Review[];
  recentVisitorIds: string[];
  submittedBy?: string;
}

export interface CollectedAircraft {
  id: string;
  typeId: string;
  registration?: string;
  airlineId: string;
  airportId: string;
  firstSeen: string;
  sightings: number;
  photoId?: string;
  verification: VerificationStage;
  rarity: Rarity;
  bestPhotoScore: number;
  specialLivery?: boolean;
  notes?: string;
}

export interface CollectionSet {
  id: string;
  name: string;
  description: string;
  category: 'manufacturer' | 'family' | 'airline' | 'historic' | 'military' | 'livery' | 'airport';
  /** Type ids (or registration ids prefixed with 'reg:') required to complete the set. */
  items: string[];
  rewardXp: number;
  icon: string;
}

export interface TradingCard {
  id: string;
  number: string; // e.g. 'AV1-014'
  series: string;
  typeId: string;
  registration?: string;
  airlineId: string;
  photoId: string;
  rarity: Rarity;
  specialEdition?: string;
  limitedRun?: number;
}

export interface OwnedCard {
  cardId: string;
  count: number;
  acquiredAt: string;
}

export type ChallengePeriod = 'daily' | 'weekly' | 'monthly' | 'airport' | 'global';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  period: ChallengePeriod;
  airportId?: string;
  target: number;
  progress: number;
  rewardXp: number;
  endsAt: string;
  icon: string;
  participants: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockedAt?: string;
  progress?: number;
  target?: number;
  military?: boolean;
}

export interface XpTransaction {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
  ref?: string;
}

export type NotificationCategory =
  | 'rare_alert'
  | 'follower'
  | 'like'
  | 'comment'
  | 'challenge'
  | 'milestone'
  | 'database'
  | 'competition'
  | 'announcement';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  route?: string;
  actorId?: string;
  photoId?: string;
}

export interface Competition {
  id: string;
  title: string;
  theme: string;
  kind: 'weekly' | 'monthly' | 'airport' | 'aircraft' | 'historic' | 'annual';
  status: 'open' | 'voting' | 'closed';
  endsAt: string;
  airportId?: string;
  coverPhotoId: string;
  prize: string;
  entries: { id: string; userId: string; photoId: string; votes: number; title: string }[];
  winners?: string[];
}

export type ProductKind = 'physical_cards' | 'print' | 'digital' | 'membership' | 'creator';

export interface Product {
  id: string;
  kind: ProductKind;
  name: string;
  subtitle: string;
  description: string;
  pricePence: number;
  photoIds: string[];
  badge?: string;
  contents?: string[];
  photographerId?: string;
  limited?: number;
  stock?: number;
}

export interface Flight {
  id: string;
  callsign: string;
  flightNumber: string;
  airlineId: string;
  typeId: string;
  registration?: string;
  originId: string;
  destinationId: string;
  lat: number;
  lon: number;
  altitudeFt: number;
  groundSpeedKt: number;
  heading: number;
  status: 'climbing' | 'cruising' | 'descending' | 'approach' | 'taxi';
  progress: number;
  /** Always true in demo mode. Live providers set this to false. */
  simulated: boolean;
  updatedAt: number;
}
