# AeroVerse — Architecture & Design System

## 1. Technology choices

| Concern | Choice | Notes |
|---|---|---|
| App | React Native + **Expo SDK 58**, TypeScript (strict) | One codebase for iOS, Android and web |
| Navigation | **Expo Router** (file-based) | Five-tab shell + stack screens and modals |
| State | **Zustand** + AsyncStorage persistence | Single store. In production, server state moves to Supabase queries |
| Backend | **Supabase**: Postgres + PostGIS, Auth, Storage, Edge Functions | Schema in `backend/supabase/migrations` |
| Maps | Custom vector map engine (`components/map/GeoMap.tsx`) | Web Mercator SVG renderer: pan, pinch, zoom, markers. Runs in Expo Go with **no API key** |
| Payments | Stripe (via Edge Function) | Test checkout in demo mode |
| Push | Expo Push (outbox pattern) | In-app only in demo mode |

**Why a custom map instead of Mapbox/Google Maps for the prototype?** Both need native config and API keys, and Mapbox can't run in Expo Go. The custom engine lets the prototype run on any phone or browser right away. All map screens use `GeoMap` with plain `lat/lon` markers and SVG layers, so you can swap in `@rnmapbox/maps` or `react-native-maps` behind the same props (`initial`, `renderMarkers`, `renderSvg`, `apiRef.flyTo/zoomBy/getBounds`) without touching screen logic. Use Mapbox for production satellite or terrain imagery around airports.

## 2. Design system

- **Tokens** (`src/theme/tokens.ts`): near-black navy foundations (`#05080F`), aviation blue `#3D8BFF`, cyan `#5CE1FF`, metallic silver, plus semantic colours for success, warning, review and simulation (amber `#FFB547` marks *anything simulated*).
- **Rarity palette**: Common grey, Uncommon green, Rare blue, Epic violet, Legendary gold, Special Edition cyan→magenta gradient.
- **Type**: Space Grotesk (display and data, technical feel) and Inter (body). Scale: hero/h1/h2/h3/title/body/small/caption/overline/data.
- **Components** (`src/components/ui`): `Button` (primary/secondary/ghost/danger/plus), `IconButton`, `Card`, `Chip`, `Pill`, `ProgressBar` (animated), `Segmented`, `Input`, `ListRow`, `ToggleRow`, `Notice`, `EmptyState`, `ErrorState`, `Skeleton`, `Sheet`, `ActionSheet`, `Toast`, and an XP celebration modal.
- **Aviation components** (`src/components/aviation.tsx`): `Photo` (always shows photographer credit and licence), `PostCard`, `TradingCardView`, `VerificationBadge`, `RarityBadge`, `SimBadge`, `Avatar`, `AircraftArt` (silhouette fallback for missing or locked items).
- **Brand**: `LogoMark` is an airliner banking through an open orbit ring with a radar wedge and a “satellite” point (the global network). Wordmark: AERO in white, VERSE in cyan, wide-tracked. App icons are generated from the same SVG.
- Accessibility: every interactive element has a role and label, text scales up to 1.4×, colour is never the only signal (icons and text accompany it), and touch targets are at least 40 pt.

## 3. Service adapters (integration seams)

Each external capability has an interface plus a demo implementation, chosen in `src/services/config.ts` by environment variables:

| Interface | Demo | Production |
|---|---|---|
| `AuthService` | `DevAuthService` (device-local, codes on screen) | `SupabaseAuthService` (email OTP verification, password reset) |
| `FlightDataProvider` | `SimulatedFlightProvider` (≈80 great-circle routes at 10× speed, `simulated: true`) | `BackendFlightProvider` → `functions/flights` → licensed provider |
| `IdentificationService` | `SimulatedIdentificationService` (scripted scenarios; never analyses pixels) | `BackendIdentificationService` → `functions/identify-aircraft` → vision + OCR providers |
| `PaymentService` | `TestPaymentService` (test card 4242…) | Stripe PaymentSheet / Checkout via `functions/create-checkout` |
| `PushService` | in-app only | Expo push tokens + `notification_outbox` worker |

No secret key is ever placed in the app. Only `EXPO_PUBLIC_*` publishable values are bundled.

## 4. Verification pipeline

Stages: upload → detection → manufacturer/family → variant → registration OCR → database cross-check → flight/location context.

Thresholds (`services/identification/thresholds.ts`, mirrored server-side):

| Check | Threshold |
|---|---|
| Detection | ≥ 0.60 |
| Family | ≥ 0.80 |
| Variant | ≥ 0.85 |
| OCR | ≥ 0.90 |

A registration is **identified** only if OCR passes **and** the registration exists in the database **and** the database type matches the visual variant **and** the variant itself passed. Otherwise the app shows “possible reading … not confirmed”. Flight/location context is supporting evidence only. It never verifies a registration on its own.

Result states: *Aircraft detected → Type identified → Variant identified → Registration identified → Community verified*, or *Needs human review*. Low-confidence sightings go to the **review queue**. XP for them is **held** until three independent reviewers agree (weighted by `trust_score` in production). Users can submit corrections with evidence at any time. Only the backend (service role) can change a sighting's verification stage; RLS blocks clients from doing so.

## 5. Rarity & XP

- **Local rarity** (`services/rarity.ts`) comes from each type's share of movements at an airport over a rolling 90-day window (`airport_type_frequency`, built nightly from licensed data): ≥2% common, ≥0.5% uncommon, ≥0.1% rare, ≥0.03% epic, otherwise legendary. Special liveries are always *Special*. An A380 is common at DXB and uncommon at MAN, but a type never seen at an airport is at least *epic* there.
- **XP** (`services/xp.ts`) rewards discovery and quality: new manufacturer (+250), family (+150), variant (+100), airline (+60), registration (+40), first airport visit (+120), verified photo (+50) and a local rarity bonus. Repeat sightings earn +5 (max 3 a day), or +15 when the photo improves on your best. Leaderboards use quality-weighted XP, not upload counts.
- **Card packs** are earned (challenges, milestones, a daily pack), never sold. Odds are disclosed before opening and guarantees are enforced in code. Physical products have fixed, listed contents.

## 6. Data model

See `backend/supabase/migrations/0001_schema.sql`. Main tables: `profiles`, `privacy_settings`, `follows`, `blocks`, `manufacturers`, `aircraft_types`, `aircraft_registrations`, `airlines`, `airports` (PostGIS), `airport_type_frequency`, `flights`, `photos`, `sightings`, `verification_reviews`, `posts`, `likes`, `saves`, `comments`, `collection_items`, `collection_sets`, `xp_transactions` (awarded/held/released/revoked), `challenges`, `challenge_progress`, `achievements`, `user_achievements`, `digital_cards`, `card_packs`, `user_cards`, `pack_grants`, `spotting_locations`, `reviews`, `checkins`, `notifications`, `notification_preferences`, `push_tokens`, `notification_outbox`, `marketplace_products`, `photo_licences`, `orders`, `subscriptions`, `reports`, `competitions`, `competition_entries`, `competition_votes`.

Security principles:
- RLS is on for every table. Reference data is read-only. Progression tables (XP, collection, cards) are written only by Edge Functions, so clients can't tamper with them.
- Blocks are enforced in read policies.
- Photos live in a private bucket, served through signed URLs. EXIF GPS is stripped on ingest.
- Check-ins are shared at airport level only, and only when the user opts in. Precise location never leaves the device.
- Military aircraft are filtered out at flight-data ingestion. The military section covers only public events and heritage.

## 7. Scaling internationally

- Airports, airlines, types and registrations are data, not code, so a new region needs no app release. Airport communities are switched on with `community_enabled`.
- Rarity is computed per airport, so it means something in every market.
- Times are stored in UTC with airport time zones. Strings are ready to move into i18n bundles (`expo-localization` and i18next recommended).
- Feeds and leaderboards use indexed `(airport_id, created_at)` queries and can be cached at the edge. Image delivery goes through a CDN with resized variants.
- Spotting-location legality differs by country. Every location carries per-field verification status and country-specific safety notes, as in the UAE example.
