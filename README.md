# AeroVerse

**The global aviation community** — aviation photography, AI-assisted aircraft identification, flight radar, spotting locations, a collectable personal hangar, digital trading cards, challenges and airport communities, in one premium mobile app.

This repository contains a working, interactive prototype built with **React Native + Expo (SDK 58) + TypeScript**. It runs on iOS, Android and web, is fully navigable and is populated with realistic demo data.

> **Honest demo mode.** No external services are connected yet. Everything that would need a third-party provider runs in a clearly labelled demo mode:
> - **Flight radar**: *simulated* traffic, labelled “DEMO · SIMULATED TRAFFIC — not real positions”.
> - **AI identification**: *simulated*. Sample photos replay scripted scenarios; your own photos get a deliberately low-confidence suggestion that you confirm and the community reviews.
> - **Auth**: development auth stored on the device; verification and reset codes are shown on screen.
> - **Payments**: test checkout only. No money is taken.
> - **Push**: in-app notifications only.
>
> Settings → *Data sources & service status* shows the live/demo state of every service.

---

## Run it locally

Requirements: Node 20+ and npm. For a phone you need the **Expo Go** app (SDK 58) or a development build.

```bash
npm install
```

```bash
npx expo start
```

Then scan the QR code with Expo Go (Android) or the Camera app (iOS). Press `w` to open in a browser.

Other useful commands:

```bash
npm run typecheck
```

```bash
npx expo export --platform web
```

```bash
npx expo run:ios
```

## Test accounts

| Email | Password | What you get |
|---|---|---|
| `demo@aeroverse.app` | `Spotter2026` | Level 9 collector at Manchester: 14 aircraft, 12 cards, packs, notifications, follows |
| `fresh@aeroverse.app` | `Spotter2026` | Verified but empty — goes through profile onboarding |

You can also create a new account. In dev mode the email verification code is shown on screen. The sign-in screen has one-tap buttons for both test accounts.
To start over: Settings → Data sources & service status → **Reset demo data**.

## A 5-minute tour

1. **Launch**: radar sweep, aircraft flight path and logo reveal. It's shorter on later launches, and you can tap to skip.
2. **Welcome → Sign in** with `demo@aeroverse.app`.
3. **Home**: featured photo, daily/weekly challenges, a feed with like (double-tap), comment, share, save, follow, *Collect*, and report/block via “…”.
4. **Upload** (camera button): pick a *sample photo* (each demonstrates a different outcome) or your own photo. Watch the verification pipeline, then add it to your hangar to earn XP. Try **“Low confidence”** to see human review, held XP and the review queue (Explore → Review Queue → My pending → *Simulate reviewer vote*).
5. **Radar**: pan, pinch or scroll to zoom, search a flight (`EK17`, `BA117`) or registration, tap an aircraft for its route and details, use filters, *Nearby*, centre on your home airport.
6. **Hangar**: completion, levels, categories, collection sets with missing silhouettes, wanted list.
7. **Explore** → Spotting Map (Manchester runways and verified vs unverified spots), Airport Communities, Photographers, Competitions, Military & Historic, Digital Cards (open a pack!), Store (test checkout), Challenges, Leaderboards (incl. MAN vs AMS), Review Queue, AeroVerse Plus.
8. **Profile** → settings, privacy & location, notification preferences, blocked users, data export, account deletion, legal placeholders and photo attributions.

## Project structure

```
src/
  app/                 Expo Router screens (file-based routes)
    (tabs)/            Home · Explore · Radar · Hangar · Profile
    auth/ onboarding   Sign in / up, verify email, reset password, profile setup
    upload/ verification/  Upload + AI verification result
    aircraft/ hangar/ post/ user/ airports/ spotting/ cards/ store/ competitions/ notifications/ settings/ …
  components/          Design system (ui/), brand (logo, launch animation), map engine, aviation components
  data/                Demo seed data (catalog, users, posts, spots, community, photos registry)
  services/            Replaceable adapters: auth, flight, identification, payments, notifications; xp & rarity engines
  store/               Zustand app state, persisted to device storage
  theme/               Design tokens
backend/supabase/      PostgreSQL schema + RLS, Edge Functions (identify-aircraft, flights, create-checkout, delete-account)
docs/                  ARCHITECTURE.md, PRODUCTION_SERVICES.md
scripts/               Asset builders (world map paths, photo registry)
assets/photos/         Demo imagery from Wikimedia Commons (see credits.json)
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): design system, app architecture, data model, verification and rarity logic, scaling.
- [docs/PRODUCTION_SERVICES.md](docs/PRODUCTION_SERVICES.md): every API key and third-party service needed for production, and how to switch each one on.

## Credits

- Aircraft photographs: Wikimedia Commons contributors, used under CC BY / CC BY-SA / public-domain licences. Credited on every photo and listed in-app (Settings → Photo attributions) and in `assets/photos/credits.json`.
- Map data: Natural Earth (public domain), via `world-atlas`.
- Fonts: Space Grotesk and Inter (SIL Open Font License).
- Demo users, posts, schedules, statistics and alerts are **fictional** and labelled as demo content.
