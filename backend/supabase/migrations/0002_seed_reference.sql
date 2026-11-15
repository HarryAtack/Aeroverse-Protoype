-- Minimal reference seed. The full demo catalogue lives in src/data/catalog.ts;
-- scripts can export it to SQL. Rarity frequencies must come from licensed data.
insert into public.manufacturers (id, name, country) values
 ('airbus','Airbus','EU'),('boeing','Boeing','US'),('embraer','Embraer','BR'),('atr','ATR','FR/IT') on conflict do nothing;
insert into public.airports (id, iata, name, city, country, location, timezone, runways, community_enabled) values
 ('EGCC','MAN','Manchester Airport','Manchester','United Kingdom', st_point(-2.275, 53.3537)::geography, 'Europe/London', '{05L/23R,05R/23L}', true),
 ('EGLL','LHR','London Heathrow','London','United Kingdom', st_point(-0.4543, 51.47)::geography, 'Europe/London', '{09L/27R,09R/27L}', true),
 ('EHAM','AMS','Amsterdam Schiphol','Amsterdam','Netherlands', st_point(4.7683, 52.3105)::geography, 'Europe/Amsterdam', '{18R/36L,06/24}', true),
 ('OMDB','DXB','Dubai International','Dubai','United Arab Emirates', st_point(55.3657, 25.2532)::geography, 'Asia/Dubai', '{12L/30R,12R/30L}', true),
 ('WSSS','SIN','Singapore Changi','Singapore','Singapore', st_point(103.9915, 1.3644)::geography, 'Asia/Singapore', '{02L/20R,02C/20C}', true)
 on conflict do nothing;
