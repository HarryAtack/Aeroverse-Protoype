import type { Achievement, AppNotification, Challenge, CollectionSet, Competition, Product, TradingCard } from '@/types/domain';
import { ago } from './posts';

const inHours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

export const challenges: Challenge[] = [
  { id: 'ch_d1', title: 'Morning Rush', description: 'Log 3 verified sightings before noon.', period: 'daily', target: 3, progress: 1, rewardXp: 120, endsAt: inHours(9), icon: 'sunny-outline', participants: 3120 },
  { id: 'ch_d2', title: 'Quality Over Quantity', description: 'Upload one photo rated "sharp" by the community.', period: 'daily', target: 1, progress: 0, rewardXp: 90, endsAt: inHours(9), icon: 'aperture-outline', participants: 2240 },
  { id: 'ch_w1', title: 'Five Liveries', description: 'Photograph five different airlines this week.', period: 'weekly', target: 5, progress: 3, rewardXp: 400, endsAt: inHours(70), icon: 'color-palette-outline', participants: 8810 },
  { id: 'ch_w2', title: 'Find an A350', description: 'Spot and verify any Airbus A350 variant.', period: 'weekly', target: 1, progress: 0, rewardXp: 300, endsAt: inHours(70), icon: 'search-outline', participants: 6630 },
  { id: 'ch_m1', title: 'Queen Hunter', description: 'Collect three different Boeing 747 variants.', period: 'monthly', target: 3, progress: 1, rewardXp: 1200, endsAt: inHours(380), icon: 'trophy-outline', participants: 4120 },
  { id: 'ch_m2', title: 'Airport Hopper', description: 'Visit and check in at three different airports.', period: 'monthly', target: 3, progress: 1, rewardXp: 900, endsAt: inHours(380), icon: 'airplane-outline', participants: 5290 },
  { id: 'ch_a1', title: 'Manchester Ten', description: 'Spot 10 different aircraft types at Manchester.', period: 'airport', airportId: 'EGCC', target: 10, progress: 6, rewardXp: 600, endsAt: inHours(200), icon: 'location-outline', participants: 1880 },
  { id: 'ch_a2', title: 'Heathrow Heavies', description: 'Photograph 4 widebody families at Heathrow.', period: 'airport', airportId: 'EGLL', target: 4, progress: 0, rewardXp: 500, endsAt: inHours(200), icon: 'location-outline', participants: 2460 },
  { id: 'ch_a3', title: 'Polderbaan Patience', description: 'Catch 3 KLM types at Schiphol.', period: 'airport', airportId: 'EHAM', target: 3, progress: 0, rewardXp: 450, endsAt: inHours(200), icon: 'location-outline', participants: 1310 },
  { id: 'ch_g1', title: 'Special Livery Season', description: 'Photograph a special or retro livery anywhere in the world.', period: 'global', target: 1, progress: 1, rewardXp: 800, endsAt: inHours(500), icon: 'sparkles-outline', participants: 21450 },
  { id: 'ch_g2', title: 'Manufacturer Master', description: 'Complete any manufacturer collection.', period: 'global', target: 1, progress: 0, rewardXp: 2000, endsAt: inHours(900), icon: 'ribbon-outline', participants: 9970 },
];

export const achievements: Achievement[] = [
  { id: 'ac_first', name: 'First Contact', description: 'Collect your first aircraft.', icon: 'airplane', tier: 'bronze', unlockedAt: ago(800) },
  { id: 'ac_family10', name: 'Family Tree', description: 'Collect 10 aircraft families.', icon: 'git-network', tier: 'silver', unlockedAt: ago(300) },
  { id: 'ac_heavy', name: 'Heavy Metal', description: 'Collect five four-engined aircraft types.', icon: 'barbell', tier: 'silver', progress: 3, target: 5 },
  { id: 'ac_verified25', name: 'Trusted Eye', description: 'Have 25 photos community-verified.', icon: 'shield-checkmark', tier: 'gold', progress: 18, target: 25 },
  { id: 'ac_globe', name: 'Globetrotter', description: 'Spot aircraft at airports on three continents.', icon: 'earth', tier: 'gold', progress: 1, target: 3 },
  { id: 'ac_special', name: 'Livery Legend', description: 'Collect 5 special liveries.', icon: 'color-palette', tier: 'gold', progress: 1, target: 5 },
  { id: 'ac_night', name: 'Night Owl', description: 'Upload a verified photo taken after dark.', icon: 'moon', tier: 'bronze', unlockedAt: ago(120) },
  { id: 'ac_helper', name: 'Ground Crew', description: 'Help verify 50 community sightings.', icon: 'people', tier: 'silver', progress: 12, target: 50 },
  { id: 'ac_comp', name: 'Podium Finish', description: 'Finish top three in a photo competition.', icon: 'podium', tier: 'platinum', progress: 0, target: 1 },
  { id: 'ac_mil_warbird', name: 'Merlin Music', description: 'Collect three Second World War aircraft.', icon: 'musical-notes', tier: 'silver', progress: 1, target: 3, military: true },
  { id: 'ac_mil_fast', name: 'Fast Jet Fan', description: 'Photograph three fast-jet types at public airshows.', icon: 'flash', tier: 'gold', progress: 1, target: 3, military: true },
  { id: 'ac_mil_museum', name: 'Curator', description: 'Check in at three aviation museums.', icon: 'business', tier: 'bronze', progress: 0, target: 3, military: true },
];

export const collectionSets: CollectionSet[] = [
  { id: 'set_airbus_wide', name: 'Airbus Widebodies', description: 'Every current-generation Airbus widebody variant.', category: 'manufacturer', items: ['a330-900', 'a350-900', 'a350-1000', 'a380-800'], rewardXp: 1500, icon: 'albums' },
  { id: 'set_boeing_747', name: 'Queen of the Skies', description: 'The jumbo jet in all its later forms.', category: 'family', items: ['b747-400', 'b747-8i', 'b747-8f'], rewardXp: 1800, icon: 'star' },
  { id: 'set_dreamliner', name: 'Dreamliner Family', description: 'Every 787 variant flying in Europe.', category: 'family', items: ['b787-9', 'b787-10'], rewardXp: 800, icon: 'cloud' },
  { id: 'set_narrow', name: 'Short-haul Heroes', description: 'Europe’s workhorse narrowbodies.', category: 'manufacturer', items: ['a320neo', 'a321neo', 'a220-300', 'b737-800', 'b737-8'], rewardXp: 900, icon: 'swap-horizontal' },
  { id: 'set_regional', name: 'Regional Connectors', description: 'Turboprops and regional jets.', category: 'manufacturer', items: ['e190', 'e195-e2', 'atr72-600'], rewardXp: 700, icon: 'git-branch' },
  { id: 'set_historic', name: 'Legends of Flight', description: 'Historic aircraft preserved or still flying.', category: 'historic', items: ['concorde', 'vulcan-b2', 'lancaster', 'spitfire'], rewardXp: 2500, icon: 'hourglass' },
  { id: 'set_raf', name: 'Royal Air Force Today', description: 'Current RAF types seen at public events.', category: 'military', items: ['typhoon', 'f35b', 'a400m', 'hawk-t1'], rewardXp: 2000, icon: 'shield' },
  { id: 'set_outsize', name: 'Outsize Cargo', description: 'The giants of the freight world.', category: 'livery', items: ['an124', 'beluga-xl', 'b747-8f'], rewardXp: 3000, icon: 'cube' },
];

export const cards: TradingCard[] = [
  { id: 'cd1', number: 'AV1-001', series: 'Series 1 · Heavies', typeId: 'a380-800', registration: 'A6-EED', airlineId: 'ek', photoId: 'a380', rarity: 'rare' },
  { id: 'cd2', number: 'AV1-002', series: 'Series 1 · Heavies', typeId: 'a350-1000', registration: 'G-XWBD', airlineId: 'ba', photoId: 'a350ba', rarity: 'rare' },
  { id: 'cd3', number: 'AV1-003', series: 'Series 1 · Heavies', typeId: 'b747-8i', registration: 'D-ABYF', airlineId: 'lh', photoId: 'b748lh', rarity: 'epic' },
  { id: 'cd4', number: 'AV1-004', series: 'Series 1 · Heavies', typeId: 'b747-8f', registration: 'LX-VCG', airlineId: 'cv', photoId: 'b748f', rarity: 'epic' },
  { id: 'cd5', number: 'AV1-005', series: 'Series 1 · Heavies', typeId: 'b777-300er', registration: 'A6-ENI', airlineId: 'ek', photoId: 'b77wek', rarity: 'common' },
  { id: 'cd6', number: 'AV1-006', series: 'Series 1 · Heavies', typeId: 'b777-300er', registration: '9V-SNC', airlineId: 'sq', photoId: 'b77wsq', rarity: 'uncommon' },
  { id: 'cd7', number: 'AV1-007', series: 'Series 1 · Heavies', typeId: 'b787-9', registration: 'G-VAHH', airlineId: 'vs', photoId: 'b789vs', rarity: 'common' },
  { id: 'cd8', number: 'AV1-008', series: 'Series 1 · Heavies', typeId: 'a350-900', registration: 'A7-ALY', airlineId: 'qr', photoId: 'a350qr', rarity: 'uncommon' },
  { id: 'cd9', number: 'AV1-009', series: 'Series 1 · Short-haul', typeId: 'a320neo', registration: 'G-UZHM', airlineId: 'u2', photoId: 'a320ezy', rarity: 'common' },
  { id: 'cd10', number: 'AV1-010', series: 'Series 1 · Short-haul', typeId: 'b737-800', registration: 'G-DRTA', airlineId: 'ls', photoId: 'b738jet2', rarity: 'common' },
  { id: 'cd11', number: 'AV1-011', series: 'Series 1 · Short-haul', typeId: 'b737-800', registration: 'EI-DWG', airlineId: 'fr', photoId: 'b738fr', rarity: 'common' },
  { id: 'cd12', number: 'AV1-012', series: 'Series 1 · Short-haul', typeId: 'a321neo', registration: 'G-WUKM', airlineId: 'w9', photoId: 'a321', rarity: 'common' },
  { id: 'cd13', number: 'AV1-013', series: 'Series 1 · Short-haul', typeId: 'a220-300', registration: 'YL-ABL', airlineId: 'bt', photoId: 'a220', rarity: 'uncommon' },
  { id: 'cd14', number: 'AV1-014', series: 'Series 1 · Regional', typeId: 'e190', registration: 'PH-EZM', airlineId: 'wa', photoId: 'e190', rarity: 'common' },
  { id: 'cd15', number: 'AV1-015', series: 'Series 1 · Regional', typeId: 'atr72-600', registration: 'G-LMTE', airlineId: 'lm', photoId: 'atr72', rarity: 'uncommon' },
  { id: 'cd16', number: 'AV1-016', series: 'Series 1 · Regional', typeId: 'e195-e2', airlineId: 'embraer', photoId: 'e195e2', rarity: 'rare' },
  { id: 'cd17', number: 'AV1-017', series: 'Series 1 · Legends', typeId: 'concorde', registration: 'G-BOAC', airlineId: 'ba', photoId: 'concorde', rarity: 'legendary' },
  { id: 'cd18', number: 'AV1-018', series: 'Series 1 · Legends', typeId: 'vulcan-b2', registration: 'XH558', airlineId: 'vttst', photoId: 'vulcan', rarity: 'legendary' },
  { id: 'cd19', number: 'AV1-019', series: 'Series 1 · Legends', typeId: 'lancaster', registration: 'PA474', airlineId: 'bbmf', photoId: 'lancaster', rarity: 'epic' },
  { id: 'cd20', number: 'AV1-020', series: 'Series 1 · Special Edition', typeId: 'b787-10', registration: 'PH-BKA', airlineId: 'kl', photoId: 'b78xkl', rarity: 'special', specialEdition: '100 Years KLM', limitedRun: 5000 },
  { id: 'cd21', number: 'AV1-021', series: 'Series 1 · Special Edition', typeId: 'b757-200', registration: 'TF-FIU', airlineId: 'fi', photoId: 'special', rarity: 'special', specialEdition: 'Hekla Aurora', limitedRun: 5000 },
  { id: 'cd22', number: 'AV1-022', series: 'Series 1 · Outsize', typeId: 'an124', airlineId: 'vda', photoId: 'an124', rarity: 'legendary' },
  { id: 'cd23', number: 'AV1-023', series: 'Series 1 · Outsize', typeId: 'beluga-xl', airlineId: 'ati', photoId: 'beluga', rarity: 'legendary' },
  { id: 'cd24', number: 'AV1-024', series: 'Series 1 · Military', typeId: 'typhoon', registration: 'ZJ914', airlineId: 'raf', photoId: 'typhoon', rarity: 'rare' },
  { id: 'cd25', number: 'AV1-025', series: 'Series 1 · Military', typeId: 'f35b', airlineId: 'raf', photoId: 'f35', rarity: 'epic' },
  { id: 'cd26', number: 'AV1-026', series: 'Series 1 · Military', typeId: 'a400m', airlineId: 'raf', photoId: 'a400m', rarity: 'rare' },
  { id: 'cd27', number: 'AV1-027', series: 'Series 1 · Military', typeId: 'hawk-t1', airlineId: 'raf', photoId: 'redarrows', rarity: 'epic' },
  { id: 'cd28', number: 'AV1-028', series: 'Series 1 · Heavies', typeId: 'b747-400', registration: 'G-BNLX', airlineId: 'ba', photoId: 'b744ba', rarity: 'epic' },
  { id: 'cd29', number: 'AV1-029', series: 'Series 1 · Heavies', typeId: 'b787-10', registration: 'PH-BKA', airlineId: 'kl', photoId: 'b78xkl', rarity: 'uncommon' },
  { id: 'cd30', number: 'AV1-030', series: 'Series 1 · Heavies', typeId: 'b777-300er', registration: 'G-STBA', airlineId: 'ba', photoId: 'b77lhr', rarity: 'common' },
];

export const cardSeries = [
  { id: 'Series 1 · Heavies', name: 'Heavies', icon: 'airplane' },
  { id: 'Series 1 · Short-haul', name: 'Short-haul', icon: 'swap-horizontal' },
  { id: 'Series 1 · Regional', name: 'Regional', icon: 'git-branch' },
  { id: 'Series 1 · Legends', name: 'Legends', icon: 'hourglass' },
  { id: 'Series 1 · Outsize', name: 'Outsize', icon: 'cube' },
  { id: 'Series 1 · Military', name: 'Military', icon: 'shield' },
  { id: 'Series 1 · Special Edition', name: 'Special Edition', icon: 'sparkles' },
];

/**
 * Pack definitions. Packs are EARNED through XP and challenges — never sold for
 * real money with random contents. Odds are always disclosed before opening.
 */
export const packTypes = [
  { id: 'pk_standard', name: 'Standard Pack', cards: 5, costXp: 500, guarantee: 'At least 1 Rare or better', odds: { common: 0.55, uncommon: 0.27, rare: 0.12, epic: 0.045, legendary: 0.012, special: 0.003 } },
  { id: 'pk_challenge', name: 'Challenge Reward Pack', cards: 3, costXp: 0, guarantee: 'At least 1 Epic or better', odds: { common: 0.3, uncommon: 0.3, rare: 0.25, epic: 0.1, legendary: 0.04, special: 0.01 } },
];

export const products: Product[] = [
  { id: 'pr_s1_box', kind: 'physical_cards', name: 'Series 1 Collector Box', subtitle: 'All 30 cards · fixed contents', description: 'The complete AeroVerse Series 1 set in a magnetic collector box with numbered dividers. Every card is included — no randomised contents.', pricePence: 3499, photoIds: ['a380', 'concorde', 'b748lh'], badge: 'Complete set', contents: ['30 numbered cards', 'Collector box', 'Checklist card', 'Photographer credits booklet'], stock: 240 },
  { id: 'pr_legends', name: 'Legends of Flight Tin', kind: 'physical_cards', subtitle: '4 cards · foil finish', description: 'Concorde, Vulcan, Lancaster and Spitfire in premium foil, presented in a metal tin.', pricePence: 1999, photoIds: ['concorde', 'vulcan', 'lancaster'], badge: 'Limited', limited: 2500, contents: ['4 foil cards (listed)', 'Display tin'], stock: 812 },
  { id: 'pr_special', name: 'Special Liveries Mini Set', kind: 'physical_cards', subtitle: '2 cards · numbered', description: 'KLM 100 Years and Icelandair Hekla Aurora special edition cards, individually numbered.', pricePence: 1299, photoIds: ['b78xkl', 'special'], badge: 'Numbered', limited: 5000, contents: ['2 numbered cards'], stock: 1440 },
  { id: 'pr_print_a380', name: '“Over the Threshold” Fine-Art Print', kind: 'print', subtitle: 'A3 giclée · photographer royalties', description: 'Archival giclée print. In production, prints are only sold for photographers who have explicitly licensed their work, and a royalty is paid on every sale.', pricePence: 4500, photoIds: ['a380'], badge: 'Creator', photographerId: 'u_sam', stock: 50 },
  { id: 'pr_print_lanc', name: '“Four Merlins” Canvas', kind: 'print', subtitle: '60×40 cm canvas', description: 'Canvas print with gallery wrap. Example creator product — licensing required in production.', pricePence: 6900, photoIds: ['lancaster'], badge: 'Creator', photographerId: 'u_will', stock: 25 },
  { id: 'pr_digital_theme', name: 'Night Ops Profile Theme', kind: 'digital', subtitle: 'Digital cosmetic', description: 'A dark amber radar-inspired theme for your profile and hangar. Cosmetic only.', pricePence: 299, photoIds: ['b748f'], stock: 9999 },
  { id: 'pr_binder', name: 'AeroVerse Card Binder', kind: 'creator', subtitle: '360-pocket premium binder', description: 'Padded binder with side-loading pockets, embossed logo and spine label.', pricePence: 2499, photoIds: ['man'], stock: 300 },
];

export const competitions: Competition[] = [
  { id: 'cp_weekly', title: 'Golden Hour', theme: 'Aircraft in the warm light just after sunrise or before sunset.', kind: 'weekly', status: 'open', endsAt: inHours(60), coverPhotoId: 'a380', prize: '2,000 XP + Golden Hour badge',
    entries: [
      { id: 'e1', userId: 'u_sam', photoId: 'a380', votes: 412, title: 'Over the threshold' },
      { id: 'e2', userId: 'u_chloe', photoId: 'b789vs', votes: 377, title: 'Soft finals' },
      { id: 'e3', userId: 'u_joost', photoId: 'b78xkl', votes: 301, title: 'Centennial' },
    ] },
  { id: 'cp_monthly', title: 'Heavy Metal', theme: 'Four-engined giants, any airport.', kind: 'monthly', status: 'voting', endsAt: inHours(140), coverPhotoId: 'b748lh', prize: 'Featured on home + Series 2 card',
    entries: [
      { id: 'e4', userId: 'u_nina', photoId: 'b748f', votes: 980, title: 'Night freighter' },
      { id: 'e5', userId: 'u_chloe', photoId: 'b748lh', votes: 1104, title: 'Sachsen-Anhalt' },
      { id: 'e6', userId: 'u_harj', photoId: 'b744ba', votes: 870, title: 'Jumbo memories' },
      { id: 'e7', userId: 'u_wei', photoId: 'a388sq', votes: 650, title: 'Home base' },
    ] },
  { id: 'cp_man', title: 'Manchester Movements', theme: 'Anything at MAN this month.', kind: 'airport', airportId: 'EGCC', status: 'open', endsAt: inHours(220), coverPhotoId: 'man', prize: 'MAN community crown',
    entries: [
      { id: 'e8', userId: 'u_tom', photoId: 'atr72', votes: 120, title: 'Island hopper' },
      { id: 'e9', userId: 'u_sam', photoId: 'concorde', votes: 340, title: 'Alpha Charlie' },
    ] },
  { id: 'cp_hist', title: 'Living History', theme: 'Historic aircraft — flying or preserved.', kind: 'historic', status: 'closed', endsAt: ago(100), coverPhotoId: 'vulcan', prize: 'Historic Editor’s Pick', winners: ['e10', 'e11', 'e12'],
    entries: [
      { id: 'e10', userId: 'u_will', photoId: 'vulcan', votes: 2210, title: 'The Howl' },
      { id: 'e11', userId: 'u_will', photoId: 'lancaster', votes: 1980, title: 'Merlin Music' },
      { id: 'e12', userId: 'u_sam', photoId: 'concorde', votes: 1540, title: 'Supersonic Rest' },
    ] },
  { id: 'cp_annual', title: 'AeroVerse Photography Awards 2026', theme: 'The annual awards across 8 categories. Submissions open in December.', kind: 'annual', status: 'open', endsAt: inHours(1100), coverPhotoId: 'b77wsq', prize: 'Trophy, print exhibition & licensing opportunities', entries: [] },
];

export const announcements = [
  { id: 'an1', title: 'Airport vs Airport: MAN takes on AMS', body: 'Two weeks, one leaderboard. Verified sightings only — quality-weighted XP.', icon: 'flag', route: '/leaderboard' },
  { id: 'an2', title: 'New in the database: A321XLR', body: 'The A321XLR has been added to the aircraft database and collection sets.', icon: 'server', route: '/aircraft/a321neo' },
];

export const seedNotifications: AppNotification[] = [
  { id: 'n1', category: 'rare_alert', title: 'Rare at Manchester', body: 'An Antonov An-124 is scheduled to visit MAN tomorrow (demo alert).', createdAt: ago(0.3), read: false, route: '/aircraft/an124', photoId: 'an124' },
  { id: 'n2', category: 'like', title: 'skyline_sam liked your photo', body: 'Jet2 737-800 at Manchester', createdAt: ago(1), read: false, actorId: 'u_sam', route: '/user/u_sam' },
  { id: 'n3', category: 'follower', title: 'New follower', body: 'contrail_chloe started following you.', createdAt: ago(3), read: false, actorId: 'u_chloe', route: '/user/u_chloe' },
  { id: 'n4', category: 'challenge', title: 'Challenge progress', body: 'Five Liveries: 3 of 5 complete. Two more airlines to go!', createdAt: ago(5), read: true, route: '/challenges' },
  { id: 'n5', category: 'milestone', title: 'Collection milestone', body: 'You have collected 10 aircraft families. “Family Tree” badge unlocked.', createdAt: ago(20), read: true, route: '/achievements' },
  { id: 'n6', category: 'competition', title: 'Golden Hour is open', body: 'Submit your best warm-light shot by Friday.', createdAt: ago(26), read: true, route: '/competitions/cp_weekly' },
  { id: 'n7', category: 'database', title: 'Database update', body: 'A321XLR added to the aircraft database.', createdAt: ago(50), read: true, route: '/aircraft/a321neo' },
  { id: 'n8', category: 'comment', title: 'turboprop_tom commented', body: '“Was stood about 50m to your left!”', createdAt: ago(60), read: true, actorId: 'u_tom', route: '/post/p1' },
  { id: 'n9', category: 'announcement', title: 'Airport vs Airport', body: 'MAN vs AMS starts Monday. Represent your home airport!', createdAt: ago(72), read: true, route: '/leaderboard' },
];
