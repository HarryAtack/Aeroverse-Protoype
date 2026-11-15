import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  AppNotification,
  CollectedAircraft,
  Comment,
  NotificationCategory,
  OwnedCard,
  Post,
  Rarity,
  Review,
  SpottingLocation,
  VerificationStage,
  XpTransaction,
} from '@/types/domain';
import { seedNotifications, cards as allCards, packTypes, challenges as seedChallenges } from '@/data/community';
import { demoCards, demoCollection, demoXp } from './seed';
import { RARITY_ORDER } from '@/services/rarity';
import type { IdentificationResult } from '@/services/identification/types';

export interface Profile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  homeAirportId: string;
  interests: string[];
  avatarColor: [string, string];
  avatarUri?: string;
  favouriteTypeId?: string;
  createdAt: string;
}

export interface MySighting {
  id: string;
  photoUri?: string;
  photoId?: string;
  typeId: string;
  registration?: string;
  airlineId: string;
  airportId: string;
  takenAt: string;
  stage: VerificationStage;
  confidence: number;
  caption?: string;
  simulated: boolean;
  votes: { agree: number; disagree: number };
  corrections: { typeId?: string; registration?: string; evidence: string; at: string }[];
  createdAt: string;
  sampleKey?: string;
  result?: IdentificationResult;
  addedToHangar?: boolean;
  hangarId?: string;
  xpAwarded?: number;
  xpPending?: number;
  shareToFeed?: boolean;
  locationPrecision?: 'airport' | 'hidden';
}

export interface Order { id: string; items: { productId: string; qty: number }[]; totalPence: number; createdAt: string; simulated: boolean }

export interface Privacy {
  profilePublic: boolean;
  showHomeAirport: boolean;
  shareCheckins: boolean;
  preciseLocation: boolean;
  showInLeaderboards: boolean;
  allowTagging: boolean;
  personalisedFeed: boolean;
}

export interface NotificationPrefs {
  categories: Record<NotificationCategory, boolean>;
  airports: string[];
  types: string[];
  airlines: string[];
  quietHours: boolean;
  push: boolean;
}

interface UserData {
  profile: Profile | null;
  collection: CollectedAircraft[];
  sightings: MySighting[];
  myPosts: Post[];
  xpLedger: XpTransaction[];
  likes: Record<string, boolean>;
  saves: Record<string, boolean>;
  follows: Record<string, boolean>;
  notifyUsers: Record<string, boolean>;
  comments: Record<string, Comment[]>;
  ownedCards: OwnedCard[];
  packs: Record<string, number>;
  cart: { productId: string; qty: number }[];
  orders: Order[];
  notifications: AppNotification[];
  notificationPrefs: NotificationPrefs;
  privacy: Privacy;
  blocked: string[];
  reports: { targetType: 'post' | 'user' | 'comment' | 'spot'; targetId: string; reason: string; at: string }[];
  wishlist: string[];
  followedTypes: string[];
  trackedFlights: string[];
  savedSpots: string[];
  checkins: { spotId: string; at: string }[];
  myReviews: Record<string, Review>;
  addedSpots: SpottingLocation[];
  spotCorrections: { spotId: string; text: string; at: string }[];
  joinedAirports: string[];
  challengeProgress: Record<string, number>;
  claimedChallenges: string[];
  competitionVotes: Record<string, boolean>;
  competitionEntries: { competitionId: string; photoId?: string; photoUri?: string; title: string; at: string }[];
  reviewVotes: Record<string, 'agree' | 'disagree' | 'unsure'>;
  plus: { active: boolean; plan?: 'monthly' | 'annual'; since?: string };
  marketplaceWaitlist: boolean;
  hiddenPosts: string[];
  lastDailyPack?: string;
}

const defaultPrefs: NotificationPrefs = {
  categories: { rare_alert: true, follower: true, like: true, comment: true, challenge: true, milestone: true, database: false, competition: true, announcement: true },
  airports: ['EGCC'],
  types: ['a380-800', 'b747-8f'],
  airlines: [],
  quietHours: true,
  push: false,
};

const defaultPrivacy: Privacy = {
  profilePublic: true,
  showHomeAirport: true,
  shareCheckins: false,
  preciseLocation: false,
  showInLeaderboards: true,
  allowTagging: true,
  personalisedFeed: true,
};

function emptyUserData(): UserData {
  return {
    profile: null, collection: [], sightings: [], myPosts: [], xpLedger: [], likes: {}, saves: {}, follows: {}, notifyUsers: {}, comments: {},
    ownedCards: [], packs: { pk_standard: 1, pk_challenge: 1 }, cart: [], orders: [], notifications: seedNotifications.slice(5), notificationPrefs: defaultPrefs,
    privacy: defaultPrivacy, blocked: [], reports: [], wishlist: [], followedTypes: [], trackedFlights: [], savedSpots: [], checkins: [], myReviews: {},
    addedSpots: [], spotCorrections: [], joinedAirports: [], challengeProgress: Object.fromEntries(seedChallenges.map((c) => [c.id, 0])), claimedChallenges: [], competitionVotes: {}, competitionEntries: [],
    reviewVotes: {}, plus: { active: false }, marketplaceWaitlist: false, hiddenPosts: [],
  };
}

function demoUserData(email: string): UserData {
  return {
    ...emptyUserData(),
    profile: {
      id: 'me_demo', email, username: 'manchester_spotter', displayName: 'Alex Morgan', bio: 'Weekend spotter at MAN. Chasing a full 747 set and every special livery I can find.',
      homeAirportId: 'EGCC', interests: ['Heavies', 'Special liveries', 'Historic'], avatarColor: ['#3D8BFF', '#B46CFF'], favouriteTypeId: 'b747-8i', createdAt: new Date(Date.now() - 400 * 86400_000).toISOString(),
    },
    challengeProgress: {}, collection: demoCollection, xpLedger: demoXp, ownedCards: demoCards, packs: { pk_standard: 2, pk_challenge: 1 },
    notifications: seedNotifications, follows: { u_sam: true, u_chloe: true, u_will: true, u_avteam: true }, joinedAirports: ['EGCC', 'EGLL'],
    savedSpots: ['s_man_rvp'], checkins: [{ spotId: 's_man_rvp', at: new Date(Date.now() - 30 * 3600_000).toISOString() }], wishlist: ['b747-8i', 'an124', 'a350-1000'],
    followedTypes: ['a380-800', 'b747-8f'],
  };
}

export interface Toast { id: number; kind: 'success' | 'error' | 'info' | 'xp'; text: string }

interface AppState extends UserData {
  hydrated: boolean;
  launches: number;
  introSeen: boolean;
  session: { userId: string; email: string } | null;
  pendingEmail?: string;
  archives: Record<string, UserData>;
  toast: Toast | null;
  celebrate: { title: string; lines: { label: string; amount: number }[]; total: number } | null;

  // lifecycle
  markLaunched: () => void;
  setIntroSeen: () => void;
  signIn: (userId: string, email: string) => void;
  signOut: () => void;
  deleteAccountLocal: () => void;
  resetDemo: () => void;
  setPendingEmail: (e?: string) => void;
  saveProfile: (p: Partial<Profile>) => void;

  // feedback
  showToast: (text: string, kind?: Toast['kind']) => void;
  clearToast: () => void;
  setCelebrate: (c: AppState['celebrate']) => void;

  // social
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  toggleFollow: (userId: string) => void;
  toggleNotifyUser: (userId: string) => void;
  addComment: (postId: string, text: string) => void;
  addPost: (p: Post) => void;
  hidePost: (postId: string) => void;
  block: (userId: string) => void;
  unblock: (userId: string) => void;
  report: (targetType: UserData['reports'][number]['targetType'], targetId: string, reason: string) => void;

  // collection & xp
  addXp: (amount: number, reason: string, ref?: string) => void;
  upsertCollected: (c: Omit<CollectedAircraft, 'id' | 'sightings' | 'firstSeen'> & { firstSeen?: string }) => CollectedAircraft;
  addSighting: (s: MySighting) => void;
  updateSighting: (id: string, patch: Partial<MySighting>) => void;
  toggleWishlist: (typeId: string) => void;
  toggleFollowType: (typeId: string) => void;
  toggleTrackFlight: (id: string) => void;

  // cards
  openPack: (packId: string) => string[];
  claimDailyPack: () => boolean;

  // store
  addToCart: (productId: string, qty?: number) => void;
  setCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  addOrder: (o: Order) => void;
  setPlus: (p: UserData['plus']) => void;
  setWaitlist: (v: boolean) => void;

  // spots & airports
  toggleSavedSpot: (id: string) => void;
  checkIn: (spotId: string) => void;
  addReview: (spotId: string, rating: number, text: string) => void;
  addSpot: (s: SpottingLocation) => void;
  suggestCorrection: (spotId: string, text: string) => void;
  toggleJoinAirport: (id: string) => void;

  // challenges & competitions
  claimChallenge: (id: string, xp: number) => void;
  bumpChallenge: (id: string, by: number) => void;
  voteEntry: (entryId: string) => void;
  enterCompetition: (e: UserData['competitionEntries'][number]) => void;
  voteReview: (sightingId: string, v: 'agree' | 'disagree' | 'unsure') => void;

  // notifications & settings
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  pushNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  setNotificationPrefs: (p: Partial<NotificationPrefs>) => void;
  setPrivacy: (p: Partial<Privacy>) => void;
}

const USER_KEYS = Object.keys(emptyUserData()) as (keyof UserData)[];
const pickUserData = (s: AppState): UserData => Object.fromEntries(USER_KEYS.map((k) => [k, s[k]])) as unknown as UserData;

let toastId = 1;
const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function drawCard(odds: Record<Rarity, number>, rand = Math.random()): string {
  let acc = 0;
  let rarity: Rarity = 'common';
  for (const r of RARITY_ORDER) {
    acc += odds[r];
    if (rand <= acc) { rarity = r; break; }
  }
  const pool = allCards.filter((c) => c.rarity === rarity);
  const list = pool.length ? pool : allCards;
  return list[Math.floor(Math.random() * list.length)].id;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...emptyUserData(),
      hydrated: false,
      launches: 0,
      introSeen: false,
      session: null,
      archives: {},
      toast: null,
      celebrate: null,

      markLaunched: () => set((s) => ({ launches: s.launches + 1 })),
      setIntroSeen: () => set({ introSeen: true }),
      setPendingEmail: (pendingEmail) => set({ pendingEmail }),

      signIn: (userId, email) => {
        const s = get();
        const archived = s.archives[userId];
        const data = archived ?? (userId === 'me_demo' ? demoUserData(email) : emptyUserData());
        set({ ...data, session: { userId, email } });
      },
      signOut: () => {
        const s = get();
        if (!s.session) return;
        const archives = { ...s.archives, [s.session.userId]: pickUserData(s) };
        set({ ...emptyUserData(), archives, session: null });
      },
      deleteAccountLocal: () => {
        const s = get();
        const archives = { ...s.archives };
        if (s.session) delete archives[s.session.userId];
        set({ ...emptyUserData(), archives, session: null });
      },
      resetDemo: () => set({ ...emptyUserData(), archives: {}, session: null, introSeen: false }),
      saveProfile: (p) =>
        set((s) => ({
          profile: {
            ...(s.profile ?? { id: s.session?.userId ?? 'me', email: s.session?.email ?? '', username: '', displayName: '', bio: '', homeAirportId: 'EGCC', interests: [], avatarColor: ['#3D8BFF', '#5CE1FF'], createdAt: new Date().toISOString() }),
            ...p,
          },
        })),

      showToast: (text, kind = 'success') => set({ toast: { id: toastId++, kind, text } }),
      clearToast: () => set({ toast: null }),
      setCelebrate: (celebrate) => set({ celebrate }),

      toggleLike: (id) => set((s) => ({ likes: { ...s.likes, [id]: !s.likes[id] } })),
      toggleSave: (id) => {
        const on = !get().saves[id];
        set((s) => ({ saves: { ...s.saves, [id]: on } }));
        get().showToast(on ? 'Saved to your collection board' : 'Removed from saved', 'info');
      },
      toggleFollow: (id) => set((s) => ({ follows: { ...s.follows, [id]: !s.follows[id] } })),
      toggleNotifyUser: (id) => set((s) => ({ notifyUsers: { ...s.notifyUsers, [id]: !s.notifyUsers[id] } })),
      addComment: (postId, text) =>
        set((s) => ({
          comments: { ...s.comments, [postId]: [...(s.comments[postId] ?? []), { id: uid('c'), userId: 'me', text, createdAt: new Date().toISOString(), likes: 0 }] },
        })),
      addPost: (p) => set((s) => ({ myPosts: [p, ...s.myPosts] })),
      hidePost: (id) => set((s) => ({ hiddenPosts: [...s.hiddenPosts, id] })),
      block: (id) => set((s) => ({ blocked: s.blocked.includes(id) ? s.blocked : [...s.blocked, id], follows: { ...s.follows, [id]: false } })),
      unblock: (id) => set((s) => ({ blocked: s.blocked.filter((b) => b !== id) })),
      report: (targetType, targetId, reason) => set((s) => ({ reports: [...s.reports, { targetType, targetId, reason, at: new Date().toISOString() }] })),

      addXp: (amount, reason, ref) => {
        if (amount <= 0) return;
        set((s) => ({ xpLedger: [...s.xpLedger, { id: uid('x'), amount, reason, ref, createdAt: new Date().toISOString() }] }));
      },
      upsertCollected: (c) => {
        const s = get();
        const existing = s.collection.find((x) => (c.registration ? x.registration === c.registration : !x.registration && x.typeId === c.typeId && x.airlineId === c.airlineId));
        if (existing) {
          const updated: CollectedAircraft = {
            ...existing,
            sightings: existing.sightings + 1,
            bestPhotoScore: Math.max(existing.bestPhotoScore, c.bestPhotoScore),
            photoId: c.bestPhotoScore > existing.bestPhotoScore ? c.photoId ?? existing.photoId : existing.photoId,
            verification: c.verification,
          };
          set({ collection: s.collection.map((x) => (x.id === existing.id ? updated : x)) });
          return updated;
        }
        const created: CollectedAircraft = { ...c, id: uid('h'), sightings: 1, firstSeen: c.firstSeen ?? new Date().toISOString() };
        set({ collection: [created, ...s.collection] });
        return created;
      },
      addSighting: (sg) => set((s) => ({ sightings: [sg, ...s.sightings] })),
      updateSighting: (id, patch) => set((s) => ({ sightings: s.sightings.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      toggleWishlist: (t) => set((s) => ({ wishlist: s.wishlist.includes(t) ? s.wishlist.filter((x) => x !== t) : [...s.wishlist, t] })),
      toggleFollowType: (t) => set((s) => ({ followedTypes: s.followedTypes.includes(t) ? s.followedTypes.filter((x) => x !== t) : [...s.followedTypes, t] })),
      toggleTrackFlight: (t) => set((s) => ({ trackedFlights: s.trackedFlights.includes(t) ? s.trackedFlights.filter((x) => x !== t) : [...s.trackedFlights, t] })),

      openPack: (packId) => {
        const s = get();
        const def = packTypes.find((p) => p.id === packId);
        if (!def || (s.packs[packId] ?? 0) < 1) return [];
        const ids: string[] = [];
        for (let i = 0; i < def.cards; i++) ids.push(drawCard(def.odds as Record<Rarity, number>));
        // honour the disclosed guarantee
        const minRank = packId === 'pk_challenge' ? 3 : 2;
        const rank = (id: string) => RARITY_ORDER.indexOf(allCards.find((c) => c.id === id)!.rarity);
        if (!ids.some((id) => rank(id) >= minRank)) {
          const pool = allCards.filter((c) => RARITY_ORDER.indexOf(c.rarity) === minRank);
          ids[ids.length - 1] = pool[Math.floor(Math.random() * pool.length)].id;
        }
        ids.sort((a, b) => rank(a) - rank(b));
        const owned = [...s.ownedCards];
        ids.forEach((id) => {
          const o = owned.find((x) => x.cardId === id);
          if (o) o.count += 1;
          else owned.push({ cardId: id, count: 1, acquiredAt: new Date().toISOString() });
        });
        set({ ownedCards: owned.map((o) => ({ ...o })), packs: { ...s.packs, [packId]: s.packs[packId] - 1 } });
        return ids;
      },
      claimDailyPack: () => {
        const s = get();
        const today = new Date().toDateString();
        if (s.lastDailyPack === today) return false;
        set({ lastDailyPack: today, packs: { ...s.packs, pk_standard: (s.packs.pk_standard ?? 0) + 1 } });
        return true;
      },

      addToCart: (productId, qty = 1) =>
        set((s) => {
          const ex = s.cart.find((c) => c.productId === productId);
          return { cart: ex ? s.cart.map((c) => (c.productId === productId ? { ...c, qty: c.qty + qty } : c)) : [...s.cart, { productId, qty }] };
        }),
      setCartQty: (productId, qty) => set((s) => ({ cart: qty <= 0 ? s.cart.filter((c) => c.productId !== productId) : s.cart.map((c) => (c.productId === productId ? { ...c, qty } : c)) })),
      clearCart: () => set({ cart: [] }),
      addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
      setPlus: (plus) => set({ plus }),
      setWaitlist: (v) => set({ marketplaceWaitlist: v }),

      toggleSavedSpot: (id) => set((s) => ({ savedSpots: s.savedSpots.includes(id) ? s.savedSpots.filter((x) => x !== id) : [...s.savedSpots, id] })),
      checkIn: (spotId) => set((s) => ({ checkins: [{ spotId, at: new Date().toISOString() }, ...s.checkins] })),
      addReview: (spotId, rating, text) => set((s) => ({ myReviews: { ...s.myReviews, [spotId]: { id: uid('r'), userId: 'me', rating, text, createdAt: new Date().toISOString() } } })),
      addSpot: (sp) => set((s) => ({ addedSpots: [sp, ...s.addedSpots] })),
      suggestCorrection: (spotId, text) => set((s) => ({ spotCorrections: [...s.spotCorrections, { spotId, text, at: new Date().toISOString() }] })),
      toggleJoinAirport: (id) => set((s) => ({ joinedAirports: s.joinedAirports.includes(id) ? s.joinedAirports.filter((x) => x !== id) : [...s.joinedAirports, id] })),

      claimChallenge: (id, xp) => {
        const s = get();
        if (s.claimedChallenges.includes(id)) return;
        set({ claimedChallenges: [...s.claimedChallenges, id], packs: { ...s.packs, pk_challenge: (s.packs.pk_challenge ?? 0) + 1 } });
        const ch = seedChallenges.find((c) => c.id === id);
        get().addXp(xp, `Challenge · ${ch?.title ?? id}`, id);
      },
      bumpChallenge: (id, by) => {
        const base = seedChallenges.find((c) => c.id === id);
        set((s) => ({ challengeProgress: { ...s.challengeProgress, [id]: Math.min(base?.target ?? 99, (s.challengeProgress[id] ?? base?.progress ?? 0) + by) } }));
      },
      voteEntry: (entryId) => set((s) => ({ competitionVotes: { ...s.competitionVotes, [entryId]: !s.competitionVotes[entryId] } })),
      enterCompetition: (e) => set((s) => ({ competitionEntries: [...s.competitionEntries, e] })),
      voteReview: (id, v) => set((s) => ({ reviewVotes: { ...s.reviewVotes, [id]: v } })),

      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      pushNotification: (n) => set((s) => ({ notifications: [{ ...n, id: uid('n'), createdAt: new Date().toISOString(), read: false }, ...s.notifications] })),
      setNotificationPrefs: (p) => set((s) => ({ notificationPrefs: { ...s.notificationPrefs, ...p } })),
      setPrivacy: (p) => set((s) => ({ privacy: { ...s.privacy, ...p } })),
    }),
    {
      name: 'aeroverse.app.v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => {
        const { toast, celebrate, hydrated, ...rest } = s;
        return Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function')) as Partial<AppState>;
      },
      onRehydrateStorage: () => () => {
        useApp.setState({ hydrated: true });
      },
    },
  ),
);

export const totalXp = (s: { xpLedger: XpTransaction[] }) => s.xpLedger.reduce((a, x) => a + x.amount, 0);
