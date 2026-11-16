# AeroVerse — Project Context

*Business and product brief for use as Claude project knowledge. Last updated November 2026.*

---

## 1. One-line summary

**AeroVerse is a global aviation community app.** It combines aviation photography and social networking, flight tracking, collecting aircraft, challenges and leaderboards, and digital and physical aircraft trading cards in one premium mobile app.

It's best described as **Instagram + Flightradar24 + Pokémon + Strava + a trading-card platform, for aviation.**

The ambition is an internationally scalable platform for millions of users, not a small plane-spotting hobby app.

---

## 2. The problem and the opportunity

- Aviation enthusiasts (plane spotters, photographers, avgeeks, airshow-goers, flight-tracking fans) are a large, passionate, global audience, but their tools are fragmented:
  - photos on general social networks or niche photo databases,
  - flight tracking in separate radar apps,
  - logbooks of "what I've seen" kept in spreadsheets, notebooks or dated logging apps,
  - spotting-location knowledge scattered across forums, Facebook groups and word of mouth.
- No product joins these into one modern, social, rewarding experience.
- Collecting is deeply natural to this hobby, because spotters already "tick off" registrations, types and liveries. A game layer (rarity, sets, XP, badges, cards) turns an existing behaviour into a habit loop.
- Every major airport has a local spotting community. That gives a natural network structure and local reasons to return every day.

---

## 3. Target users

| Segment | What they want |
|---|---|
| **Plane spotters / loggers** | Log registrations, complete collections, find rare visitors, know what's coming in |
| **Aviation photographers** | Showcase portfolios, get recognition, enter competitions, potentially earn from licensing (prints, cards) |
| **Casual avgeeks / travellers** | Identify what they saw, follow flights, enjoy great photography |
| **Military & historic enthusiasts** | Airshows, museums, warbirds, heritage flights |
| **Local airport communities** | A place for their airport: local feed, leaderboards, alerts, discussions |
| **Collectors** | Digital and physical aircraft trading cards and sets |

Launch focus: **UK first, with Manchester as the flagship example community**, then Heathrow, Gatwick and Birmingham, then Amsterdam Schiphol, Frankfurt, Dubai, Singapore Changi and Tokyo Haneda.

---

## 4. Core product pillars

1. **Community & photography:** a personalised feed, posts, likes, comments, follows, photographer discovery, competitions.
2. **AI-assisted identification & verification:** upload a photo and AeroVerse suggests the type, variant and registration, with honest confidence levels and community review.
3. **Flight radar:** a live map of aircraft with flight details, search, filters and nearby traffic (from a licensed data provider).
4. **Spotting locations:** a global map of verified viewing areas and community-suggested spots, with reviews, safety and access information.
5. **Personal hangar (collection):** every aircraft you've spotted, with rarity, sets, completion and milestones.
6. **Progression:** XP, levels, badges, daily, weekly, monthly, airport and global challenges, and quality-weighted leaderboards.
7. **Trading cards:** digital card sets (earned, not bought) and a physical card and print store.
8. **Airport communities:** each airport has its own feed, sightings, leaderboard, challenges, spots, statistics and discussions.
9. **Military & historic section:** airshows, museums, warbirds and heritage aviation (public sources only).

---

## 5. Detailed feature set

### Navigation
A bottom tab bar with five destinations: **Home · Explore · Radar · Collection (Hangar) · Profile**. Everything else is reached from those screens.

### Home feed
- Posts from followed users, trending aircraft, popular photographers, recent verified sightings, featured airports, community announcements, daily and weekly challenges, rare-aircraft alerts and recommended users.
- Each post shows the user, photo, aircraft type, registration (where known), airline or operator, airport and location, date and time, verification status, likes, comments and shares, and an option to collect.
- Users can like, comment, follow, save, share, report and block. There's a prominent upload button.

### Aircraft identification & verification (critical feature)
The pipeline runs: upload → aircraft detection → manufacturer and family → variant → registration OCR → database cross-check → flight and location evidence → result with confidence.

Verification states:
- Aircraft detected
- Type identified
- Variant identified
- Registration identified
- Community verified
- Needs human review

**Accuracy rule (non-negotiable):** a registration is never shown as verified just because AI guessed it. It counts as "identified" only when all of these hold:
- OCR confidence is high (≥ 90%),
- the registration exists in the database,
- the database type matches the visual identification,
- the variant was itself confidently identified.

Flight and location data is supporting evidence only.

Confidence thresholds used: detection ≥ 60%, family ≥ 80%, variant ≥ 85%, OCR ≥ 90%.

Sightings below the thresholds go to a **community review queue**. XP is held until three trusted reviewers agree. Users can submit corrections with evidence.

### Flight radar
- An interactive world map with aircraft icons pointing in their direction of travel.
- Flight details: flight number, type, registration, airline, origin and destination, altitude, speed, heading and status.
- Search by flight, registration, type or airport. Filter by airline, manufacturer, family, phase and altitude.
- A route view, nearby aircraft, centring on your home airport, follow-a-type alerts and save-to-wanted-list.
- **Must use a properly licensed flight-data provider. Never scrape Flightradar24 or any restricted source.** Simulated data must always be labelled as simulated.
- Military and privacy-blocked aircraft are never shown.

### Plane-spotting locations
- A map of airports, official viewing areas, public spots, photography positions, observation decks, museums, airshows and community suggestions.
- Each location has: photos, reviews and ratings, best viewing opportunities, and runway visibility, parking and transport information, each marked verified, community-reported or unknown. It also lists facilities, safety and access notes, recent sightings, nearby aircraft activity and comments.
- Users can add spots, rate, review, save, check in, see recent visitors and suggest corrections.
- **Verified public locations are clearly separated from unverified suggestions.** AeroVerse never implies public access rights and never encourages trespassing.
- Location sharing is opt-in and limited to airport level. A user's precise live location is never shown to others.
- Example: Manchester Airport, with the official Runway Visitor Park (home of Concorde G-BOAC) plus illustrative community suggestions.

### Personal hangar (collection)
- Collected aircraft, completion %, manufacturers, families, variants, airlines, registrations, historic, military, vintage, rare liveries and special editions.
- Each item is shown as a card with: photo, manufacturer, model, variant, registration, operator, first-collected date, airport, rarity, verification status, number of sightings and collector.
- Collection sets (e.g. "Queen of the Skies: 747-400, 747-8i, 747-8F") show missing items as silhouettes.
- A wanted list for types or aircraft you're hunting.

### Rarity system
- Tiers: **Common · Uncommon · Rare · Epic · Legendary · Special Edition.**
- Rarity is based on **real-world frequency at each airport**, not arbitrary labels. An A380 is common at Dubai but uncommon at Manchester.
- Thresholds use each type's share of movements over a rolling 90-day window: ≥ 2% common, ≥ 0.5% uncommon, ≥ 0.1% rare, ≥ 0.03% epic, otherwise legendary. Special liveries are always Special Edition.
- Special categories: rare liveries, historic, first-generation, manufacturer collections, unusual variants, special registrations, airshow appearances and military.

### XP, challenges & achievements
- XP rewards meaningful discovery and quality:
  - new manufacturer (+250), family (+150), variant (+100), airline (+60), registration (+40),
  - first airport visit (+120), verified photo (+50), rarity bonus.
- Repeat sightings are capped (small XP, max 3 a day). An improved photo of the same aircraft earns a bonus.
- **Volume isn't rewarded.** Leaderboards use quality-weighted, verified contributions.
- Levels, badges, achievements, daily, weekly, monthly, airport-specific and global challenges.
- Leaderboards: global, per airport, and airport-vs-airport competitions (e.g. MAN vs AMS).

### Trading cards
- Digital cards show: aircraft image, registration, type, airline, manufacturer, rarity, card number, photographer credit, series and special-edition status.
- There's a premium pack-opening animation, sets, duplicates and a future trading marketplace (card-for-card, no cash value).
- **No gambling mechanics:** packs are earned through challenges, milestones and a daily free pack, never sold for money. Odds are always disclosed.
- Physical products (card boxes, tins, prints) have **fixed, listed contents**.
- Physical cards and prints that use community photos require explicit photographer licensing, attribution and a royalty.

### Airport communities
Each airport has a local feed, recent sightings, local photographers, leaderboard, challenges, spotting locations, popular aircraft, statistics and discussions. Rotating challenges, rare-livery alerts and competitions give a one-airport spotter reasons to return daily.

### Military aviation
A dedicated section, not a separate app. It covers military collections, historic aircraft, airshow and museum photography, aircraft information, military achievements and a dedicated feed. **It never exposes operational military movements or sensitive information.**

### Profiles & social
- Profiles show: username, picture, bio, home airport, favourite aircraft, totals, portfolio, achievements, level and XP, followers, following, airport visits and completion.
- Users can follow, like, comment, share, save, compare stats and turn on post notifications.
- A photographer discovery page. Reporting, blocking and moderation.

### Notifications
Categories: rare aircraft at your home airport, followers, likes and comments, challenge progress, milestones, database updates, competitions and announcements. Users configure them by airport, aircraft type, airline and category. Push is architected for later.

### Search
A global search across registrations, types, manufacturers, airlines, airports, flights, users and photographers, spots, cards and challenges, with results grouped by category.

### Photography competitions
Weekly, monthly, airport, aircraft, historic and the annual AeroVerse Photography Awards. Users can submit, vote and comment, and winners are featured. **Photographers keep their rights.** Entering grants a display-only licence, and commercial use needs a separate licence.

### Settings, privacy & account
Account creation, login, email verification, password reset, profile editing, notification preferences, privacy settings, location permissions, blocked users, account deletion, data export, and terms and privacy-policy placeholders. Precise location sharing is never mandatory.

---

## 6. Monetisation

1. **AeroVerse Plus** subscription (test pricing: £4.99/month or £39.99/year). It includes advanced collection stats, enhanced alerts, advanced airport statistics, custom profile themes, extra collection organisation, exclusive challenges and premium badges. *Plus never affects verification, leaderboards or pack odds.*
2. **Physical trading cards** with fixed contents (collector boxes, limited tins, numbered special editions).
3. **Photography prints and creator products**, with a royalty to licensed photographers.
4. **Digital cosmetics** (profile themes).
5. **Future:** a marketplace for creator photography products, partnerships with airports, airlines, museums and airshows, and sponsored challenges.

Loot boxes and paid random packs are excluded on purpose, for ethical, regulatory and brand-trust reasons.

---

## 7. Brand & design direction

- **Name:** AeroVerse.
- **Feel:** premium, modern, technical, slightly futuristic. Credible, never childish. The game elements are polished, not cartoonish.
- **Visuals:** dark navy and near-black foundations, aviation-blue (#3D8BFF) and cyan (#5CE1FF) accents, white type, subtle metallic detailing, restrained gradients and glass effects. Aircraft photography is the hero.
- **Rarity colours:** Common grey, Uncommon green, Rare blue, Epic violet, Legendary gold, Special Edition cyan→magenta.
- **Type:** Space Grotesk (display and data) and Inter (body).
- **Logo:** an airliner banking through an open orbit ring, with a radar wedge and a "satellite" dot. Wordmark: AERO in white, VERSE in cyan.
- **Launch animation:** dark background, radar sweep, an aircraft crossing on a flight path, the logo resolves, the wordmark reveals, then a smooth transition. It's short and shorter still on repeat launches.
- Design concepts being explored: Clean & Modern, Fun & Playful, Instagram-style, and Cockpit/Avionics.

---

## 8. Principles & non-negotiables

- Never claim AI identification is 100% accurate. Never mark a registration verified from an AI guess alone.
- Never present simulated data as live. Label demo and simulated content clearly.
- Use only licensed flight data. No scraping of Flightradar24 or other restricted sources.
- Never compromise user privacy. Location is opt-in, check-ins are airport-level only, and EXIF GPS is stripped from uploads.
- Never encourage trespassing or imply public access rights. Separate verified spots from community suggestions.
- Never expose sensitive military information or treat restricted movements as trackable.
- Photographers own their photos. Commercial use requires explicit licensing, credit and payment.
- No gambling-style mechanics. Disclose odds.
- Reward quality, originality and verified contributions, not upload volume.
- No dead buttons. Every interaction must do something real or clearly explain why it can't yet.

---

## 9. Technology

- **App:** React Native + Expo (SDK 58), TypeScript, Expo Router. Runs on iOS, Android and web.
- **Backend:** Supabase (Postgres + PostGIS, Auth, Storage, Edge Functions) with row-level security on every table.
- **Maps:** a custom vector map in the prototype (no API key needed). Mapbox is recommended for production.
- **Replaceable service adapters**, each with a demo and a live implementation:
  - Auth: Dev → Supabase Auth
  - Flight data: Simulated → licensed provider via backend
  - AI identification: Simulated → vision + OCR provider via backend
  - Payments: Test → Stripe
  - Push: in-app → Expo Push
- **Security:** no secret keys in the app. All provider keys live in backend secrets. Progression (XP, collection, cards) is written only by the backend to prevent tampering.
- **Data model** (main tables): profiles, privacy settings, follows, blocks, manufacturers, aircraft types, registrations, airlines, airports, airport type frequency, flights, photos, sightings, verification reviews, posts, likes, saves, comments, collection items and sets, XP transactions, challenges, achievements, digital cards, card packs, user cards, spotting locations, reviews, check-ins, notifications and preferences, push tokens, marketplace products, photo licences, orders, subscriptions, reports, and competitions with entries and votes.

### Production services still needed
1. Supabase project.
2. A licensed flight-data API.
3. An aircraft image-recognition model or API.
4. An OCR provider.
5. A licensed aircraft registration database.
6. Stripe.
7. EAS and Expo Push.
8. Mapbox.
9. Transactional email.
10. Content moderation API.
11. Error monitoring (e.g. Sentry).
12. A print-on-demand or card manufacturer.

---

## 10. Current status (prototype)

- A **working interactive prototype has been built** (GitHub repo `harryatack/aeroverse-protoype`, branch `claude/lucid-goldberg-ixll4v`). It includes every major screen and flow: launch animation, onboarding, auth, feed, upload and verification, review queue, radar, spotting map, hangar, cards with pack opening, store and test checkout, Plus, challenges, leaderboards, airport communities, military, competitions, search, notifications and full settings.
- It runs in **demo mode**: simulated radar and AI, device-only dev auth, test payments and in-app notifications, all clearly labelled.
- Demo users, posts, statistics and alerts are fictional. Aircraft photos are real Wikimedia Commons images, credited.
- Test accounts: `demo@aeroverse.app` / `Spotter2026` (pre-built collection) and `fresh@aeroverse.app` / `Spotter2026` (empty).
- A web preview is published as a private Claude artifact.
- The backend schema and Edge Functions are written but not yet deployed.

---

## 11. Suggested roadmap

1. **Design:** choose a visual direction from the four concepts and refine the design system.
2. **Foundations:** a live Supabase project (auth, database, storage) and moving the app from demo to real accounts.
3. **Identification MVP:** a licensed registration database, a first aircraft classifier for common types, OCR, and the review queue with real moderators.
4. **Data partnerships:** sign a licensed flight-data provider and compute real per-airport rarity.
5. **Closed beta at Manchester:** the spotting community, Runway Visitor Park partnership, local challenges and feedback.
6. **UK rollout:** Heathrow, Gatwick, Birmingham. Plus subscriptions and the first physical card series with licensed community photos.
7. **International:** Schiphol, Frankfurt, Dubai, Changi, Haneda. Localisation and airport partnerships.

---

## 12. Open questions & risks

- Cost and licensing terms of flight-data and registration databases for consumer redistribution.
- Accuracy of AI identification across similar variants. This needs a training dataset and ongoing community verification.
- Legal review: airport photography laws vary by country (e.g. the UAE), plus spotting-location liability, GDPR/UK GDPR, photo licensing and royalties.
- Moderation at scale (stolen photos, harassment, unsafe or trespassing content, sensitive military posts).
- Cold start: seeding content and communities airport by airport.
- Balancing gamification with credibility for serious spotters.

---

## 13. Glossary

- **Spotter / plane spotting:** observing, logging and photographing aircraft.
- **Registration (reg):** an aircraft's unique ID, like a number plate (e.g. G-XWBD, A6-EED).
- **Type / family / variant:** e.g. Airbus (manufacturer) → A350 (family) → A350-1000 (variant).
- **ICAO / IATA codes:** airport and airline codes (EGCC / MAN for Manchester).
- **Livery:** an aircraft's paint scheme. Special liveries are rare, one-off designs.
- **Heavy:** a large widebody aircraft (747, A380, 777…).
- **ADS-B:** the broadcast system aircraft use to report position. Basis of flight tracking.
- **Hangar:** a user's AeroVerse collection.
