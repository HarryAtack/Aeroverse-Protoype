# Production services & API keys

Everything below is **optional for the prototype**, which runs entirely in demo mode. Add each service to switch that feature to live mode.

| # | Service | Used for | Where the key lives | Variable(s) |
|---|---|---|---|---|
| 1 | **Supabase** project | Auth (email OTP), Postgres + PostGIS, Storage, Edge Functions | App: URL + anon key (public by design). Server: service role key (secret) | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY` (auto-set in Edge Functions) |
| 2 | **Licensed flight-data provider** (e.g. a commercial ADS-B / flight-tracking API licensed for redistribution in apps) | Radar positions, flight numbers, routes, schedule evidence, movement statistics for rarity | Edge Function secret | `FLIGHT_API_URL`, `FLIGHT_API_KEY` |
| 3 | **Image recognition** (custom-trained aircraft classifier, e.g. on a managed vision platform, or a hosted model endpoint) | Detection, family and variant classification | Edge Function secret | `VISION_API_URL`, `VISION_API_KEY` |
| 4 | **OCR** provider (cloud OCR or a dedicated registration-reading model) | Reading registrations | Edge Function secret | `OCR_API_URL`, `OCR_API_KEY` |
| 5 | **Aircraft registration database** (licensed fleet data and/or national civil aviation registers where re-use is permitted) | Registration → type/operator cross-checks | Imported server-side into `aircraft_registrations` | — |
| 6 | **Stripe** | Physical store, prints, AeroVerse Plus subscriptions | App: publishable key. Server: secret + webhook secret | `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` · `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PLUS_MONTHLY`, `STRIPE_PRICE_PLUS_ANNUAL` |
| 7 | **Expo Application Services (EAS)** + Expo Push | Builds, OTA updates, push notifications | EAS project / Expo access token (CI only) | `EXPO_TOKEN` (CI) |
| 8 | **Mapbox** (recommended) or Google Maps | Satellite/terrain basemaps around airports | App public token + build-time download token | `EXPO_PUBLIC_MAPBOX_TOKEN`, `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` |
| 9 | **Transactional email** (via Supabase SMTP settings) | Verification and password-reset emails | Supabase dashboard | SMTP credentials |
| 10 | **Content moderation** (image safety + text toxicity) | Automated pre-screening of uploads and comments | Edge Function secret | `MODERATION_API_KEY` |
| 11 | **Error monitoring & analytics** (e.g. Sentry) | Crash reporting, performance | App DSN (public) | `EXPO_PUBLIC_SENTRY_DSN` |
| 12 | **Print-on-demand / card manufacturer** | Fulfilment of physical cards and prints | Server secret | `FULFILMENT_API_KEY` |

## Switching on live mode

1. Create a Supabase project. Run the migrations in `backend/supabase/migrations` with `supabase db push`.
2. Deploy the functions:
   ```bash
   supabase functions deploy identify-aircraft flights create-checkout delete-account
   ```
3. Set the secrets (example):
   ```bash
   supabase secrets set FLIGHT_API_URL=... FLIGHT_API_KEY=... VISION_API_URL=... VISION_API_KEY=... OCR_API_URL=... OCR_API_KEY=... STRIPE_SECRET_KEY=...
   ```
4. Copy `.env.example` to `.env` and fill in the `EXPO_PUBLIC_*` values. `src/services/config.ts` then switches each adapter to live mode automatically. Settings → *Data sources & service status* confirms which mode each service is in.
5. Stripe payments and Mapbox need native modules. Build a development client:
   ```bash
   npx expo run:ios
   ```

## Compliance notes

- **Do not** scrape Flightradar24 or other restricted sources. Use only providers whose licence allows display in a consumer app. Respect aircraft owners' privacy-block lists (`aircraft_registrations.hidden`).
- Exclude military and sensitive flights at ingestion. The military section shows public-event content only.
- Photos: photographers keep copyright. Any commercial use needs an explicit `photo_licences` row with royalty terms and credit.
- GDPR/UK GDPR: data export and deletion are already built (Settings). You still need finalised Terms, a Privacy Policy, a DPA with each processor, and a DPIA for location features.
- Randomised packs: they're kept non-purchasable on purpose. If paid packs are ever considered, get legal advice on loot-box regulation in each market and always disclose odds.
