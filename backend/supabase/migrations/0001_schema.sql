-- AeroVerse core schema (PostgreSQL / Supabase)
-- Every user-owned table has Row Level Security enabled. Reference data is
-- readable by everyone and writable only by the service role (backend jobs).

create extension if not exists "pgcrypto";
create extension if not exists "postgis";
create extension if not exists citext;

-- ───────────────────────── Enums ─────────────────────────
create type rarity as enum ('common','uncommon','rare','epic','legendary','special');
create type aircraft_category as enum ('airliner','regional','cargo','military','historic','special');
create type verification_stage as enum ('unverified','detected','type_identified','variant_identified','registration_identified','community_verified','needs_review');
create type spot_kind as enum ('official_viewing','observation_deck','public_spot','photo_position','museum','airshow','community');
create type info_status as enum ('verified','community','unknown');
create type challenge_period as enum ('daily','weekly','monthly','airport','global');
create type notification_category as enum ('rare_alert','follower','like','comment','challenge','milestone','database','competition','announcement');
create type product_kind as enum ('physical_cards','print','digital','membership','creator');
create type visibility as enum ('public','followers','private');

-- ───────────────────────── Users ─────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null default '',
  bio text not null default '' check (char_length(bio) <= 160),
  avatar_path text,
  home_airport_id text,
  favourite_type_id text,
  interests text[] not null default '{}',
  level int not null default 1,
  xp_total int not null default 0,
  is_plus boolean not null default false,
  trust_score real not null default 0.5,          -- reviewer weight, 0..1
  role text not null default 'member' check (role in ('member','moderator','admin')),
  created_at timestamptz not null default now()
);

create table public.privacy_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  profile_visibility visibility not null default 'public',
  show_home_airport boolean not null default true,
  share_checkins boolean not null default false,    -- airport-level only, never GPS
  show_in_leaderboards boolean not null default true,
  allow_tagging boolean not null default true
);

create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  followee_id uuid references public.profiles(id) on delete cascade,
  notify_posts boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create table public.blocks (
  blocker_id uuid references public.profiles(id) on delete cascade,
  blocked_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

-- ───────────────────────── Reference data ─────────────────────────
create table public.manufacturers (id text primary key, name text not null, country text);
create table public.aircraft_types (
  id text primary key, manufacturer_id text references public.manufacturers(id),
  family text not null, variant text not null, icao text not null,
  category aircraft_category not null, first_flight text, engines text,
  seats_typical text, range_km int, length_m real, wingspan_m real,
  description text, base_rarity rarity not null default 'common', in_production boolean,
  created_at timestamptz not null default now()
);
create table public.airlines (id text primary key, name text not null, iata text, icao text, country text, brand_color text, is_military boolean not null default false);
create table public.airports (
  id text primary key,            -- ICAO
  iata text, name text not null, city text, country text,
  location geography(point) not null, timezone text, runways text[],
  community_enabled boolean not null default false, spotting_note text
);
create table public.aircraft_registrations (
  registration text primary key, type_id text references public.aircraft_types(id),
  airline_id text references public.airlines(id), msn text, delivered date,
  livery text, special_livery boolean not null default false,
  hidden boolean not null default false,   -- owner privacy requests (e.g. PIA/LADD-style blocks)
  notes text, updated_at timestamptz not null default now()
);
-- Movement-frequency aggregates (from LICENSED movement data) drive local rarity.
create table public.airport_type_frequency (
  airport_id text references public.airports(id), type_id text references public.aircraft_types(id),
  window_days int not null default 90, share real not null, computed_at timestamptz not null default now(),
  primary key (airport_id, type_id)
);

-- Flights cache (filled by the backend from a licensed provider; never scraped).
create table public.flights (
  id text primary key, callsign text, flight_number text, airline_id text references public.airlines(id),
  type_id text references public.aircraft_types(id), registration text,
  origin_id text, destination_id text, position geography(point), altitude_ft int,
  ground_speed_kt int, heading int, status text, provider text not null, updated_at timestamptz not null
);
create index on public.flights using gist(position);

-- ───────────────────────── Content ─────────────────────────
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,               -- Supabase Storage, EXIF GPS stripped server-side
  width int, height int, quality_score real,
  licence text not null default 'display_only' check (licence in ('display_only','licensing_open','licensed_commercial')),
  created_at timestamptz not null default now()
);

create table public.sightings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_id uuid references public.photos(id) on delete set null,
  type_id text references public.aircraft_types(id),
  registration text references public.aircraft_registrations(registration),
  airline_id text references public.airlines(id),
  airport_id text references public.airports(id),
  taken_at timestamptz not null,
  location_precision text not null default 'airport' check (location_precision in ('airport','hidden')),
  stage verification_stage not null default 'unverified',
  ai_result jsonb,                           -- full pipeline output incl. confidences
  confidence real,
  local_rarity rarity,
  caption text,
  created_at timestamptz not null default now()
);
create index on public.sightings(user_id, created_at desc);
create index on public.sightings(airport_id, created_at desc);

create table public.verification_reviews (
  id uuid primary key default gen_random_uuid(),
  sighting_id uuid not null references public.sightings(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  vote text not null check (vote in ('agree','disagree','unsure')),
  suggested_type_id text, suggested_registration text, evidence text,
  created_at timestamptz not null default now(),
  unique (sighting_id, reviewer_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sighting_id uuid references public.sightings(id) on delete cascade,
  caption text, visibility visibility not null default 'public',
  like_count int not null default 0, comment_count int not null default 0, share_count int not null default 0,
  removed boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.likes (user_id uuid references public.profiles(id) on delete cascade, post_id uuid references public.posts(id) on delete cascade, created_at timestamptz default now(), primary key (user_id, post_id));
create table public.saves (user_id uuid references public.profiles(id) on delete cascade, post_id uuid references public.posts(id) on delete cascade, created_at timestamptz default now(), primary key (user_id, post_id));
create table public.comments (
  id uuid primary key default gen_random_uuid(), post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade, body text not null check (char_length(body) between 1 and 400),
  removed boolean not null default false, created_at timestamptz not null default now()
);

-- ───────────────────────── Collection & progression ─────────────────────────
create table public.collection_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type_id text not null references public.aircraft_types(id),
  registration text, airline_id text, first_airport_id text,
  first_seen timestamptz not null, sightings_count int not null default 1,
  best_photo_id uuid references public.photos(id), best_photo_score real,
  rarity_at_collection rarity not null, stage verification_stage not null,
  unique nulls not distinct (user_id, type_id, registration, airline_id)
);
create table public.collection_sets (id text primary key, name text, description text, category text, items text[] not null, reward_xp int not null);

create table public.xp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount int not null, reason text not null, ref_type text, ref_id text,
  status text not null default 'awarded' check (status in ('awarded','held','released','revoked')),
  created_at timestamptz not null default now()
);
create table public.challenges (id text primary key, title text, description text, period challenge_period, airport_id text references public.airports(id), target int, reward_xp int, starts_at timestamptz, ends_at timestamptz, rules jsonb);
create table public.challenge_progress (user_id uuid references public.profiles(id) on delete cascade, challenge_id text references public.challenges(id), progress int not null default 0, claimed_at timestamptz, primary key (user_id, challenge_id));
create table public.achievements (id text primary key, name text, description text, icon text, tier text, rules jsonb);
create table public.user_achievements (user_id uuid references public.profiles(id) on delete cascade, achievement_id text references public.achievements(id), unlocked_at timestamptz default now(), primary key (user_id, achievement_id));

-- ───────────────────────── Cards ─────────────────────────
create table public.digital_cards (id text primary key, number text unique, series text, type_id text, registration text, airline_id text, photo_id uuid references public.photos(id), photographer_credit text, rarity rarity, special_edition text, limited_run int);
create table public.card_packs (id text primary key, name text, cards int, guarantee text, odds jsonb not null);    -- odds always disclosed
create table public.user_cards (user_id uuid references public.profiles(id) on delete cascade, card_id text references public.digital_cards(id), count int not null default 1, acquired_at timestamptz default now(), primary key (user_id, card_id));
create table public.pack_grants (id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id) on delete cascade, pack_id text references public.card_packs(id), source text not null check (source in ('challenge','milestone','daily')), opened_at timestamptz, result text[]);

-- ───────────────────────── Places ─────────────────────────
create table public.spotting_locations (
  id uuid primary key default gen_random_uuid(), name text not null, kind spot_kind not null,
  airport_id text references public.airports(id), location geography(point) not null,
  verified boolean not null default false, summary text,
  runway_visibility text, runway_visibility_status info_status default 'unknown',
  parking text, parking_status info_status default 'unknown',
  transport text, transport_status info_status default 'unknown',
  facilities text[] default '{}', safety text, submitted_by uuid references public.profiles(id),
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create table public.reviews (id uuid primary key default gen_random_uuid(), location_id uuid references public.spotting_locations(id) on delete cascade, user_id uuid references public.profiles(id) on delete cascade, rating int check (rating between 1 and 5), body text, created_at timestamptz default now(), unique (location_id, user_id));
create table public.checkins (id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id) on delete cascade, location_id uuid references public.spotting_locations(id) on delete cascade, shared boolean not null default false, created_at timestamptz default now());

-- ───────────────────────── Notifications ─────────────────────────
create table public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id) on delete cascade, category notification_category, title text, body text, route text, actor_id uuid, read_at timestamptz, created_at timestamptz default now());
create table public.notification_preferences (user_id uuid primary key references public.profiles(id) on delete cascade, categories jsonb not null default '{}', airports text[] default '{}', types text[] default '{}', airlines text[] default '{}', quiet_hours boolean default true, push boolean default false);
create table public.push_tokens (user_id uuid references public.profiles(id) on delete cascade, token text primary key, platform text, created_at timestamptz default now());
create table public.notification_outbox (id bigserial primary key, user_id uuid, payload jsonb, sent_at timestamptz);

-- ───────────────────────── Commerce ─────────────────────────
create table public.marketplace_products (id text primary key, kind product_kind, name text, subtitle text, description text, price_pence int not null, photographer_id uuid references public.profiles(id), licence_id uuid, contents text[], limited_run int, stock int, active boolean default true);
create table public.photo_licences (id uuid primary key default gen_random_uuid(), photo_id uuid references public.photos(id), photographer_id uuid references public.profiles(id), scope text not null, royalty_bps int not null, granted_at timestamptz default now(), revoked_at timestamptz);
create table public.orders (id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id) on delete set null, stripe_payment_intent text unique, status text default 'pending', total_pence int, items jsonb, shipping jsonb, created_at timestamptz default now());
create table public.subscriptions (user_id uuid primary key references public.profiles(id) on delete cascade, plan text check (plan in ('monthly','annual')), stripe_subscription_id text unique, status text, current_period_end timestamptz);

-- ───────────────────────── Moderation ─────────────────────────
create table public.reports (id uuid primary key default gen_random_uuid(), reporter_id uuid references public.profiles(id) on delete set null, target_type text, target_id text, reason text, details text, status text default 'open', created_at timestamptz default now());

-- ───────────────────────── Competitions ─────────────────────────
create table public.competitions (id text primary key, title text, theme text, kind text, status text, airport_id text, starts_at timestamptz, ends_at timestamptz, prize text);
create table public.competition_entries (id uuid primary key default gen_random_uuid(), competition_id text references public.competitions(id), user_id uuid references public.profiles(id) on delete cascade, photo_id uuid references public.photos(id), title text, unique (competition_id, user_id));
create table public.competition_votes (entry_id uuid references public.competition_entries(id) on delete cascade, voter_id uuid references public.profiles(id) on delete cascade, weight real not null default 1, primary key (entry_id, voter_id));

-- ───────────────────────── Row Level Security ─────────────────────────
do $$ declare t text; begin
  foreach t in array array['profiles','privacy_settings','follows','blocks','photos','sightings','verification_reviews','posts','likes','saves','comments',
    'collection_items','xp_transactions','challenge_progress','user_achievements','user_cards','pack_grants','spotting_locations','reviews','checkins',
    'notifications','notification_preferences','push_tokens','orders','subscriptions','reports','competition_entries','competition_votes',
    'manufacturers','aircraft_types','airlines','airports','aircraft_registrations','airport_type_frequency','flights','collection_sets','challenges',
    'achievements','digital_cards','card_packs','marketplace_products','competitions','photo_licences','notification_outbox']
  loop execute format('alter table public.%I enable row level security', t); end loop; end $$;

-- Reference data: read-only to clients.
do $$ declare t text; begin
  foreach t in array array['manufacturers','aircraft_types','airlines','airports','airport_type_frequency','collection_sets','challenges','achievements','digital_cards','card_packs','marketplace_products','competitions']
  loop execute format('create policy "read %1$s" on public.%1$I for select using (true)', t); end loop; end $$;
create policy "read visible registrations" on public.aircraft_registrations for select using (not hidden);
-- Flights: authenticated read; military already excluded at ingestion.
create policy "read flights" on public.flights for select to authenticated using (true);

-- Helper: is the viewer blocked by / blocking the owner?
create or replace function public.is_blocked(a uuid, b uuid) returns boolean language sql stable as $$
  select exists(select 1 from public.blocks where (blocker_id=a and blocked_id=b) or (blocker_id=b and blocked_id=a)) $$;

create policy "profiles readable" on public.profiles for select using (not public.is_blocked(auth.uid(), id));
create policy "own profile update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);

create policy "own privacy" on public.privacy_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "follows read" on public.follows for select using (true);
create policy "follows write" on public.follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id and not public.is_blocked(follower_id, followee_id));
create policy "own blocks" on public.blocks for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

create policy "photos owner" on public.photos for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "photos public read" on public.photos for select using (exists(select 1 from public.posts p join public.sightings s on s.id = p.sighting_id where s.photo_id = photos.id and p.visibility = 'public' and not p.removed));

-- Sightings: owners write; verification stage can ONLY be changed by the backend (service role).
create policy "sightings owner read" on public.sightings for select using (auth.uid() = user_id);
create policy "sightings owner insert" on public.sightings for insert with check (auth.uid() = user_id and stage = 'unverified');
create policy "sightings queue read" on public.sightings for select to authenticated using (stage = 'needs_review' and not public.is_blocked(auth.uid(), user_id));

create policy "review vote" on public.verification_reviews for insert with check (auth.uid() = reviewer_id and auth.uid() <> (select user_id from public.sightings where id = sighting_id));
create policy "review read" on public.verification_reviews for select using (true);

create policy "posts read" on public.posts for select using (not removed and (visibility = 'public' or auth.uid() = user_id or (visibility = 'followers' and exists(select 1 from public.follows f where f.follower_id = auth.uid() and f.followee_id = posts.user_id))) and not public.is_blocked(auth.uid(), user_id));
create policy "posts own write" on public.posts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own likes" on public.likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own saves" on public.saves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "comments read" on public.comments for select using (not removed and not public.is_blocked(auth.uid(), user_id));
create policy "comments write" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments delete own" on public.comments for delete using (auth.uid() = user_id);

-- Progression data is written only by backend functions (prevents XP / rarity tampering).
create policy "collection read own" on public.collection_items for select using (auth.uid() = user_id);
create policy "collection read public" on public.collection_items for select using (exists(select 1 from public.privacy_settings ps where ps.user_id = collection_items.user_id and ps.profile_visibility = 'public'));
create policy "xp read own" on public.xp_transactions for select using (auth.uid() = user_id);
create policy "progress read own" on public.challenge_progress for select using (auth.uid() = user_id);
create policy "achievements read" on public.user_achievements for select using (true);
create policy "cards read own" on public.user_cards for select using (auth.uid() = user_id);
create policy "packs read own" on public.pack_grants for select using (auth.uid() = user_id);

create policy "spots read" on public.spotting_locations for select using (moderation_status <> 'rejected');
create policy "spots suggest" on public.spotting_locations for insert with check (auth.uid() = submitted_by and verified = false and moderation_status = 'pending');
create policy "reviews read" on public.reviews for select using (true);
create policy "reviews own" on public.reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "checkins own" on public.checkins for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "checkins shared read" on public.checkins for select using (shared);

create policy "own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "mark read" on public.notifications for update using (auth.uid() = user_id);
create policy "own prefs" on public.notification_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own tokens" on public.push_tokens for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own orders" on public.orders for select using (auth.uid() = user_id);
create policy "own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "file report" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "entries read" on public.competition_entries for select using (true);
create policy "enter own" on public.competition_entries for insert with check (auth.uid() = user_id and exists(select 1 from public.photos ph where ph.id = photo_id and ph.owner_id = auth.uid()));
create policy "vote own" on public.competition_votes for insert with check (auth.uid() = voter_id);
create policy "votes read" on public.competition_votes for select using (true);
-- photo_licences, notification_outbox: service role only (no client policies).

-- Storage bucket for photos (private; served via signed URLs).
insert into storage.buckets (id, name, public) values ('photos', 'photos', false) on conflict do nothing;
create policy "upload own photos" on storage.objects for insert to authenticated with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "read own photos" on storage.objects for select to authenticated using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
