import type { Airline, Airport, AircraftType, Manufacturer, Registration } from '@/types/domain';

/**
 * Reference catalogue used by the demo build.
 * Aircraft specifications are typical published figures and are rounded.
 * Airport "typeFrequency" values are ILLUSTRATIVE demo numbers used to show how
 * location-based rarity works — they are not real movement statistics.
 */

export const manufacturers: Manufacturer[] = [
  { id: 'airbus', name: 'Airbus', country: 'EU' },
  { id: 'boeing', name: 'Boeing', country: 'US' },
  { id: 'embraer', name: 'Embraer', country: 'BR' },
  { id: 'atr', name: 'ATR', country: 'FR/IT' },
  { id: 'bac', name: 'BAC / Aérospatiale', country: 'UK/FR' },
  { id: 'avro', name: 'Avro', country: 'UK' },
  { id: 'eurofighter', name: 'Eurofighter', country: 'EU' },
  { id: 'lockheed', name: 'Lockheed Martin', country: 'US' },
  { id: 'bae', name: 'BAE Systems', country: 'UK' },
  { id: 'antonov', name: 'Antonov', country: 'UA' },
  { id: 'supermarine', name: 'Supermarine', country: 'UK' },
];

export const aircraftTypes: AircraftType[] = [
  { id: 'a220-300', manufacturerId: 'airbus', family: 'A220', variant: 'A220-300', icao: 'BCS3', category: 'airliner', firstFlight: '2015', engines: '2 × PW1500G', seatsTypical: '120–150', rangeKm: 6300, lengthM: 38.7, wingspanM: 35.1, description: 'Clean-sheet narrowbody originally developed by Bombardier as the CSeries, now built by Airbus.', photoId: 'a220', baseRarity: 'uncommon', inProduction: true },
  { id: 'a320neo', manufacturerId: 'airbus', family: 'A320', variant: 'A320neo', icao: 'A20N', category: 'airliner', firstFlight: '2014', engines: '2 × LEAP-1A / PW1100G', seatsTypical: '150–186', rangeKm: 6300, lengthM: 37.6, wingspanM: 35.8, description: 'Re-engined A320 with new-generation engines and sharklets. A backbone of European short-haul flying.', photoId: 'a320ezy', baseRarity: 'common', inProduction: true },
  { id: 'a321neo', manufacturerId: 'airbus', family: 'A320', variant: 'A321neo', icao: 'A21N', category: 'airliner', firstFlight: '2016', engines: '2 × LEAP-1A / PW1100G', seatsTypical: '180–240', rangeKm: 7400, lengthM: 44.5, wingspanM: 35.8, description: 'The stretched member of the A320neo family and one of the best-selling airliners of its generation.', photoId: 'a321', baseRarity: 'common', inProduction: true },
  { id: 'a330-900', manufacturerId: 'airbus', family: 'A330', variant: 'A330-900', icao: 'A339', category: 'airliner', firstFlight: '2017', engines: '2 × Trent 7000', seatsTypical: '260–300', rangeKm: 13300, lengthM: 63.7, wingspanM: 64, description: 'The A330neo: a re-engined A330 with a new wing tip and Trent 7000 engines.', photoId: '', baseRarity: 'uncommon', inProduction: true },
  { id: 'a350-900', manufacturerId: 'airbus', family: 'A350', variant: 'A350-900', icao: 'A359', category: 'airliner', firstFlight: '2013', engines: '2 × Trent XWB-84', seatsTypical: '300–350', rangeKm: 15000, lengthM: 66.8, wingspanM: 64.8, description: 'Carbon-composite long-haul twin, recognisable by its curved wingtips and "masked" cockpit windows.', photoId: 'a350qr', baseRarity: 'uncommon', inProduction: true },
  { id: 'a350-1000', manufacturerId: 'airbus', family: 'A350', variant: 'A350-1000', icao: 'A35K', category: 'airliner', firstFlight: '2016', engines: '2 × Trent XWB-97', seatsTypical: '350–410', rangeKm: 16100, lengthM: 73.8, wingspanM: 64.8, description: 'The stretched A350 with six-wheel main gear bogies — a useful spotting clue against the -900.', photoId: 'a350ba', baseRarity: 'rare', inProduction: true },
  { id: 'a380-800', manufacturerId: 'airbus', family: 'A380', variant: 'A380-800', icao: 'A388', category: 'airliner', firstFlight: '2005', engines: '4 × Trent 900 / GP7200', seatsTypical: '480–575', rangeKm: 15000, lengthM: 72.7, wingspanM: 79.8, description: 'The world’s largest passenger airliner, with a full-length upper deck. Production ended in 2021.', photoId: 'a380', baseRarity: 'uncommon', inProduction: false },
  { id: 'beluga-xl', manufacturerId: 'airbus', family: 'Beluga', variant: 'BelugaXL', icao: 'A337', category: 'special', firstFlight: '2018', engines: '2 × Trent 700', lengthM: 63.1, wingspanM: 60.3, description: 'Outsize transporter based on the A330, used to move Airbus aircraft sections between factories.', photoId: 'beluga', baseRarity: 'legendary', inProduction: false },
  { id: 'a400m', manufacturerId: 'airbus', family: 'A400M', variant: 'A400M Atlas', icao: 'A400', category: 'military', firstFlight: '2009', engines: '4 × Europrop TP400-D6', lengthM: 45.1, wingspanM: 42.4, description: 'Four-engine turboprop military airlifter, operated by the RAF as the Atlas C1.', photoId: 'a400m', baseRarity: 'rare', inProduction: true },

  { id: 'b737-800', manufacturerId: 'boeing', family: '737', variant: '737-800', icao: 'B738', category: 'airliner', firstFlight: '1997', engines: '2 × CFM56-7B', seatsTypical: '162–189', rangeKm: 5400, lengthM: 39.5, wingspanM: 35.8, description: 'The most widely flown member of the 737 Next Generation family.', photoId: 'b738jet2', baseRarity: 'common', inProduction: false },
  { id: 'b737-8', manufacturerId: 'boeing', family: '737', variant: '737-8 (MAX)', icao: 'B38M', category: 'airliner', firstFlight: '2016', engines: '2 × LEAP-1B', seatsTypical: '162–210', rangeKm: 6570, lengthM: 39.5, wingspanM: 35.9, description: 'Re-engined 737 with split-tip winglets and serrated engine nacelles.', photoId: '', baseRarity: 'common', inProduction: true },
  { id: 'b747-400', manufacturerId: 'boeing', family: '747', variant: '747-400', icao: 'B744', category: 'airliner', firstFlight: '1988', engines: '4 × RB211 / CF6 / PW4000', seatsTypical: '400–420', rangeKm: 13450, lengthM: 70.6, wingspanM: 64.4, description: 'The classic "Queen of the Skies" with winglets and a glass cockpit. Now rare in passenger service.', photoId: 'b744ba', baseRarity: 'rare', inProduction: false },
  { id: 'b747-8i', manufacturerId: 'boeing', family: '747', variant: '747-8 Intercontinental', icao: 'B748', category: 'airliner', firstFlight: '2011', engines: '4 × GEnx-2B', seatsTypical: '410–467', rangeKm: 14300, lengthM: 76.3, wingspanM: 68.4, description: 'The longest 747, with a stretched upper deck, raked wingtips and GEnx engines.', photoId: 'b748lh', baseRarity: 'rare', inProduction: false },
  { id: 'b747-8f', manufacturerId: 'boeing', family: '747', variant: '747-8F', icao: 'B748', category: 'cargo', firstFlight: '2010', engines: '4 × GEnx-2B', lengthM: 76.3, wingspanM: 68.4, description: 'Freighter 747-8 with a nose cargo door and short upper deck. The final 747s ever built were -8Fs.', photoId: 'b748f', baseRarity: 'rare', inProduction: false },
  { id: 'b757-200', manufacturerId: 'boeing', family: '757', variant: '757-200', icao: 'B752', category: 'airliner', firstFlight: '1982', engines: '2 × RB211-535 / PW2000', seatsTypical: '180–220', rangeKm: 7250, lengthM: 47.3, wingspanM: 38.1, description: 'Powerful narrowbody known for its tall gear and steep climb-outs.', photoId: 'special', baseRarity: 'uncommon', inProduction: false },
  { id: 'b777-200er', manufacturerId: 'boeing', family: '777', variant: '777-200ER', icao: 'B772', category: 'airliner', firstFlight: '1996', engines: '2 × GE90 / Trent 800 / PW4000', seatsTypical: '300–350', rangeKm: 13080, lengthM: 63.7, wingspanM: 60.9, description: 'Extended-range version of the original 777.', photoId: 'b77lhr', baseRarity: 'uncommon', inProduction: false },
  { id: 'b777-300er', manufacturerId: 'boeing', family: '777', variant: '777-300ER', icao: 'B77W', category: 'airliner', firstFlight: '2003', engines: '2 × GE90-115B', seatsTypical: '350–400', rangeKm: 13650, lengthM: 73.9, wingspanM: 64.8, description: 'The long-haul workhorse with the largest turbofans of its era and raked wingtips.', photoId: 'b77wek', baseRarity: 'common', inProduction: true },
  { id: 'b787-9', manufacturerId: 'boeing', family: '787', variant: '787-9', icao: 'B789', category: 'airliner', firstFlight: '2013', engines: '2 × Trent 1000 / GEnx-1B', seatsTypical: '280–300', rangeKm: 14000, lengthM: 62.8, wingspanM: 60.1, description: 'The stretched Dreamliner. Look for chevron nacelles and flexing wings.', photoId: 'b789vs', baseRarity: 'common', inProduction: true },
  { id: 'b787-10', manufacturerId: 'boeing', family: '787', variant: '787-10', icao: 'B78X', category: 'airliner', firstFlight: '2017', engines: '2 × Trent 1000 TEN / GEnx-1B', seatsTypical: '330–340', rangeKm: 11900, lengthM: 68.3, wingspanM: 60.1, description: 'The longest Dreamliner, optimised for medium-to-long routes.', photoId: 'b78xkl', baseRarity: 'uncommon', inProduction: true },

  { id: 'e190', manufacturerId: 'embraer', family: 'E-Jet', variant: 'E190', icao: 'E190', category: 'regional', firstFlight: '2004', engines: '2 × CF34-10E', seatsTypical: '96–114', rangeKm: 4500, lengthM: 36.2, wingspanM: 28.7, description: 'First-generation E-Jet widely used for European city links.', photoId: 'e190', baseRarity: 'common', inProduction: false },
  { id: 'e195-e2', manufacturerId: 'embraer', family: 'E-Jet E2', variant: 'E195-E2', icao: 'E295', category: 'regional', firstFlight: '2017', engines: '2 × PW1900G', seatsTypical: '120–146', rangeKm: 4800, lengthM: 41.5, wingspanM: 35.1, description: 'Largest of the second-generation E-Jets with a new high-aspect-ratio wing.', photoId: 'e195e2', baseRarity: 'rare', inProduction: true },
  { id: 'atr72-600', manufacturerId: 'atr', family: 'ATR 72', variant: 'ATR 72-600', icao: 'AT76', category: 'regional', firstFlight: '2009', engines: '2 × PW127M', seatsTypical: '68–78', rangeKm: 1500, lengthM: 27.2, wingspanM: 27.1, description: 'Efficient high-wing turboprop and a regional staple across the UK and Europe.', photoId: 'atr72', baseRarity: 'uncommon', inProduction: true },
  { id: 'an124', manufacturerId: 'antonov', family: 'An-124', variant: 'An-124-100 Ruslan', icao: 'A124', category: 'cargo', firstFlight: '1982', engines: '4 × Progress D-18T', lengthM: 69.1, wingspanM: 73.3, description: 'One of the largest cargo aircraft ever built, with a lifting nose and rear ramp.', photoId: 'an124', baseRarity: 'legendary', inProduction: false },

  { id: 'concorde', manufacturerId: 'bac', family: 'Concorde', variant: 'Concorde 102', icao: 'CONC', category: 'historic', firstFlight: '1969', engines: '4 × Olympus 593', seatsTypical: '100', rangeKm: 7200, lengthM: 61.7, wingspanM: 25.6, description: 'The supersonic airliner, retired in 2003. G-BOAC is preserved at Manchester’s Runway Visitor Park.', photoId: 'concorde', baseRarity: 'legendary', inProduction: false },
  { id: 'vulcan-b2', manufacturerId: 'avro', family: 'Vulcan', variant: 'Vulcan B2', icao: 'VULC', category: 'historic', firstFlight: '1952', engines: '4 × Olympus 301', lengthM: 30.5, wingspanM: 33.8, description: 'Cold War delta-wing bomber. XH558 was the last airworthy example until 2015.', photoId: 'vulcan', baseRarity: 'legendary', inProduction: false },
  { id: 'lancaster', manufacturerId: 'avro', family: 'Lancaster', variant: 'Lancaster B.I', icao: 'LANC', category: 'historic', firstFlight: '1941', engines: '4 × Merlin', lengthM: 21.1, wingspanM: 31.1, description: 'Second World War heavy bomber. PA474 flies with the Battle of Britain Memorial Flight.', photoId: 'lancaster', baseRarity: 'epic', inProduction: false },
  { id: 'spitfire', manufacturerId: 'supermarine', family: 'Spitfire', variant: 'Spitfire Mk IX', icao: 'SPIT', category: 'historic', firstFlight: '1936', engines: '1 × Merlin', lengthM: 9.5, wingspanM: 11.2, description: 'The iconic elliptical-wing fighter, still flown at airshows around the world.', photoId: '', baseRarity: 'epic', inProduction: false },
  { id: 'typhoon', manufacturerId: 'eurofighter', family: 'Typhoon', variant: 'Typhoon FGR4', icao: 'EUFI', category: 'military', firstFlight: '1994', engines: '2 × EJ200', lengthM: 16, wingspanM: 11, description: 'Multi-role canard-delta fighter flown by the RAF and partner air forces.', photoId: 'typhoon', baseRarity: 'rare', inProduction: true },
  { id: 'f35b', manufacturerId: 'lockheed', family: 'F-35', variant: 'F-35B Lightning', icao: 'F35', category: 'military', firstFlight: '2008', engines: '1 × F135', lengthM: 15.6, wingspanM: 10.7, description: 'Short take-off / vertical landing variant of the F-35, flown by the RAF and Royal Navy.', photoId: 'f35', baseRarity: 'epic', inProduction: true },
  { id: 'hawk-t1', manufacturerId: 'bae', family: 'Hawk', variant: 'Hawk T1', icao: 'HAWK', category: 'military', firstFlight: '1974', engines: '1 × Adour', lengthM: 11.2, wingspanM: 9.4, description: 'Advanced jet trainer famously flown by the Red Arrows display team.', photoId: 'redarrows', baseRarity: 'epic', inProduction: false },
];

export const airlines: Airline[] = [
  { id: 'ek', name: 'Emirates', iata: 'EK', icao: 'UAE', country: 'AE', color: '#D71921' },
  { id: 'ba', name: 'British Airways', iata: 'BA', icao: 'BAW', country: 'GB', color: '#2E5C99' },
  { id: 'qr', name: 'Qatar Airways', iata: 'QR', icao: 'QTR', country: 'QA', color: '#5C0632' },
  { id: 'u2', name: 'easyJet', iata: 'U2', icao: 'EZY', country: 'GB', color: '#FF6600' },
  { id: 'ls', name: 'Jet2', iata: 'LS', icao: 'EXS', country: 'GB', color: '#E4002B' },
  { id: 'fr', name: 'Ryanair', iata: 'FR', icao: 'RYR', country: 'IE', color: '#073590' },
  { id: 'lh', name: 'Lufthansa', iata: 'LH', icao: 'DLH', country: 'DE', color: '#F9B000' },
  { id: 'cv', name: 'Cargolux', iata: 'CV', icao: 'CLX', country: 'LU', color: '#C8102E' },
  { id: 'sq', name: 'Singapore Airlines', iata: 'SQ', icao: 'SIA', country: 'SG', color: '#F99F1C' },
  { id: 'vs', name: 'Virgin Atlantic', iata: 'VS', icao: 'VIR', country: 'GB', color: '#DA0530' },
  { id: 'kl', name: 'KLM', iata: 'KL', icao: 'KLM', country: 'NL', color: '#00A1DE' },
  { id: 'wa', name: 'KLM Cityhopper', iata: 'WA', icao: 'KLC', country: 'NL', color: '#00A1DE' },
  { id: 'lm', name: 'Loganair', iata: 'LM', icao: 'LOG', country: 'GB', color: '#2B3990' },
  { id: 'fi', name: 'Icelandair', iata: 'FI', icao: 'ICE', country: 'IS', color: '#002F87' },
  { id: 'w9', name: 'Wizz Air UK', iata: 'W9', icao: 'WUK', country: 'GB', color: '#C6007E' },
  { id: 'bt', name: 'airBaltic', iata: 'BT', icao: 'BTI', country: 'LV', color: '#B9CF00' },
  { id: 'ati', name: 'Airbus Transport International', iata: '4Y', icao: 'BGA', country: 'FR', color: '#00205B' },
  { id: 'vda', name: 'Volga-Dnepr', iata: 'VI', icao: 'VDA', country: '—', color: '#1F4E9C' },
  { id: 'embraer', name: 'Embraer (demonstrator)', iata: '—', icao: '—', country: 'BR', color: '#0A3D91' },
  { id: 'raf', name: 'Royal Air Force', iata: '—', icao: 'RFR', country: 'GB', color: '#5A6B7A', military: true },
  { id: 'bbmf', name: 'Battle of Britain Memorial Flight', iata: '—', icao: '—', country: 'GB', color: '#55613F', military: true },
  { id: 'vttst', name: 'Vulcan to the Sky Trust', iata: '—', icao: '—', country: 'GB', color: '#3B4A5C' },
  { id: 'private', name: 'Private / Preserved', iata: '—', icao: '—', country: '—', color: '#7C8BA6' },
];

const f = (o: Record<string, number>) => o;

export const airports: Airport[] = [
  { id: 'EGCC', iata: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom', lat: 53.3537, lon: -2.275, photoId: 'man', members: 18420, timezone: 'Europe/London', runways: ['05L/23R', '05R/23L'], typeFrequency: f({ 'b737-800': 0.21, 'a320neo': 0.14, 'a321neo': 0.09, 'b787-9': 0.035, 'b777-300er': 0.03, 'a380-800': 0.022, 'a350-900': 0.018, 'a350-1000': 0.004, 'e190': 0.03, 'atr72-600': 0.012, 'b747-400': 0.0008, 'b747-8i': 0.0006, 'b747-8f': 0.002, 'an124': 0.0002, 'b757-200': 0.004, 'e195-e2': 0.0015, 'a220-300': 0.006, 'b787-10': 0.002 }), spottingNote: 'Official Runway Visitor Park on site. Both runways typically operate on westerly (23) days.' },
  { id: 'EGLL', iata: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom', lat: 51.47, lon: -0.4543, photoId: 'lhr', members: 26310, timezone: 'Europe/London', runways: ['09L/27R', '09R/27L'], typeFrequency: f({ 'a320neo': 0.16, 'a321neo': 0.08, 'b777-300er': 0.08, 'b787-9': 0.07, 'a350-1000': 0.03, 'a350-900': 0.04, 'a380-800': 0.035, 'b777-200er': 0.05, 'b787-10': 0.015, 'b747-8i': 0.006, 'e190': 0.02 }) },
  { id: 'EGKK', iata: 'LGW', name: 'London Gatwick', city: 'London', country: 'United Kingdom', lat: 51.1537, lon: -0.1821, photoId: 'b738fr', members: 11240, timezone: 'Europe/London', runways: ['08R/26L'], typeFrequency: f({ 'a320neo': 0.3, 'a321neo': 0.12, 'b737-800': 0.12, 'b787-9': 0.03 }) },
  { id: 'EGBB', iata: 'BHX', name: 'Birmingham Airport', city: 'Birmingham', country: 'United Kingdom', lat: 52.4539, lon: -1.748, photoId: 'b738jet2', members: 6120, timezone: 'Europe/London', runways: ['15/33'], typeFrequency: f({ 'b737-800': 0.3, 'a320neo': 0.15, 'e190': 0.05, 'atr72-600': 0.03 }) },
  { id: 'EHAM', iata: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lon: 4.7683, photoId: 'ams', members: 21780, timezone: 'Europe/Amsterdam', runways: ['18R/36L Polderbaan', '06/24 Kaagbaan', '18C/36C', '18L/36R', '09/27', '04/22'], typeFrequency: f({ 'e190': 0.12, 'b737-800': 0.18, 'b787-10': 0.03, 'b787-9': 0.025, 'b777-300er': 0.03, 'a350-900': 0.02, 'e195-e2': 0.03, 'a380-800': 0.004 }) },
  { id: 'EDDF', iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lon: 8.5622, photoId: 'b748lh', members: 14660, timezone: 'Europe/Berlin', runways: ['07L/25R', '07C/25C', '07R/25L', '18 West'], typeFrequency: f({ 'b747-8i': 0.02, 'a350-900': 0.04, 'a320neo': 0.2, 'b787-9': 0.02, 'a380-800': 0.01 }) },
  { id: 'OMDB', iata: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'United Arab Emirates', lat: 25.2532, lon: 55.3657, photoId: 'dxb', members: 17350, timezone: 'Asia/Dubai', runways: ['12L/30R', '12R/30L'], typeFrequency: f({ 'b777-300er': 0.32, 'a380-800': 0.22, 'b737-800': 0.08, 'a350-900': 0.02, 'b787-9': 0.03 }), spottingNote: 'Photography near airports in the UAE may be restricted. Always check local laws and only use public areas.' },
  { id: 'WSSS', iata: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', lat: 1.3644, lon: 103.9915, photoId: 'sin', members: 15980, timezone: 'Asia/Singapore', runways: ['02L/20R', '02C/20C', '02R/20L'], typeFrequency: f({ 'a350-900': 0.12, 'b777-300er': 0.08, 'b787-10': 0.07, 'a380-800': 0.04, 'a320neo': 0.15 }) },
  { id: 'RJTT', iata: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan', lat: 35.5494, lon: 139.7798, photoId: 'b77wsq', members: 12890, timezone: 'Asia/Tokyo', runways: ['16R/34L', '16L/34R', '04/22', '05/23'], typeFrequency: f({ 'b787-9': 0.12, 'b777-300er': 0.08, 'a350-900': 0.06, 'b737-800': 0.15 }) },
];

/** Additional airports used only as origins / destinations in simulated flights. */
export const routeAirports: { id: string; iata: string; city: string; lat: number; lon: number }[] = [
  { id: 'KJFK', iata: 'JFK', city: 'New York', lat: 40.6413, lon: -73.7781 },
  { id: 'KLAX', iata: 'LAX', city: 'Los Angeles', lat: 33.9416, lon: -118.4085 },
  { id: 'LEMD', iata: 'MAD', city: 'Madrid', lat: 40.4983, lon: -3.5676 },
  { id: 'LEPA', iata: 'PMI', city: 'Palma', lat: 39.5517, lon: 2.7388 },
  { id: 'LEBL', iata: 'BCN', city: 'Barcelona', lat: 41.2974, lon: 2.0833 },
  { id: 'LFPG', iata: 'CDG', city: 'Paris', lat: 49.0097, lon: 2.5479 },
  { id: 'LIRF', iata: 'FCO', city: 'Rome', lat: 41.8003, lon: 12.2389 },
  { id: 'OTHH', iata: 'DOH', city: 'Doha', lat: 25.2731, lon: 51.6081 },
  { id: 'VHHH', iata: 'HKG', city: 'Hong Kong', lat: 22.308, lon: 113.9185 },
  { id: 'YSSY', iata: 'SYD', city: 'Sydney', lat: -33.9399, lon: 151.1753 },
  { id: 'KORD', iata: 'ORD', city: 'Chicago', lat: 41.9742, lon: -87.9073 },
  { id: 'CYYZ', iata: 'YYZ', city: 'Toronto', lat: 43.6777, lon: -79.6248 },
  { id: 'EIDW', iata: 'DUB', city: 'Dublin', lat: 53.4264, lon: -6.2499 },
  { id: 'EGPH', iata: 'EDI', city: 'Edinburgh', lat: 55.9508, lon: -3.3615 },
  { id: 'BIKF', iata: 'KEF', city: 'Reykjavík', lat: 63.985, lon: -22.6056 },
  { id: 'LTFM', iata: 'IST', city: 'Istanbul', lat: 41.2753, lon: 28.7519 },
  { id: 'EKCH', iata: 'CPH', city: 'Copenhagen', lat: 55.618, lon: 12.6508 },
  { id: 'LOWW', iata: 'VIE', city: 'Vienna', lat: 48.1103, lon: 16.5697 },
  { id: 'OMAA', iata: 'AUH', city: 'Abu Dhabi', lat: 24.433, lon: 54.6511 },
  { id: 'VIDP', iata: 'DEL', city: 'Delhi', lat: 28.5562, lon: 77.1 },
  { id: 'ZBAA', iata: 'PEK', city: 'Beijing', lat: 40.0799, lon: 116.6031 },
  { id: 'KSFO', iata: 'SFO', city: 'San Francisco', lat: 37.6213, lon: -122.379 },
  { id: 'KATL', iata: 'ATL', city: 'Atlanta', lat: 33.6407, lon: -84.4277 },
  { id: 'FAOR', iata: 'JNB', city: 'Johannesburg', lat: -26.1367, lon: 28.2411 },
  { id: 'SBGR', iata: 'GRU', city: 'São Paulo', lat: -23.4356, lon: -46.4731 },
  { id: 'LPPT', iata: 'LIS', city: 'Lisbon', lat: 38.7742, lon: -9.1342 },
  { id: 'GCTS', iata: 'TFS', city: 'Tenerife', lat: 28.0445, lon: -16.5725 },
  { id: 'LGAV', iata: 'ATH', city: 'Athens', lat: 37.9364, lon: 23.9445 },
  { id: 'EVRA', iata: 'RIX', city: 'Riga', lat: 56.9236, lon: 23.9711 },
  { id: 'ELLX', iata: 'LUX', city: 'Luxembourg', lat: 49.6233, lon: 6.2044 },
  { id: 'KBOS', iata: 'BOS', city: 'Boston', lat: 42.3656, lon: -71.0096 },
  { id: 'VTBS', iata: 'BKK', city: 'Bangkok', lat: 13.69, lon: 100.7501 },
  { id: 'RKSI', iata: 'ICN', city: 'Seoul', lat: 37.4602, lon: 126.4407 },
  { id: 'EDDM', iata: 'MUC', city: 'Munich', lat: 48.3538, lon: 11.7861 },
  { id: 'LSZH', iata: 'ZRH', city: 'Zurich', lat: 47.4582, lon: 8.5555 },
  { id: 'EGPF', iata: 'GLA', city: 'Glasgow', lat: 55.8719, lon: -4.4331 },
  { id: 'EGAA', iata: 'BFS', city: 'Belfast', lat: 54.6575, lon: -6.2158 },
  { id: 'LEMG', iata: 'AGP', city: 'Málaga', lat: 36.6749, lon: -4.4991 },
  { id: 'LEAL', iata: 'ALC', city: 'Alicante', lat: 38.2822, lon: -0.5582 },
  { id: 'LPFR', iata: 'FAO', city: 'Faro', lat: 37.0144, lon: -7.9659 },
  { id: 'EDHI', iata: 'XFW', city: 'Hamburg Finkenwerder', lat: 53.5353, lon: 9.8356 },
  { id: 'LFBO', iata: 'TLS', city: 'Toulouse', lat: 43.6291, lon: 1.3638 },
];

/**
 * Sample registrations. These belong to real aircraft photographed in the
 * bundled Commons imagery; their use on the simulated radar is illustrative only.
 */
export const registrations: Registration[] = [
  { reg: 'A6-EED', typeId: 'a380-800', airlineId: 'ek', livery: 'Standard' },
  { reg: 'G-XWBD', typeId: 'a350-1000', airlineId: 'ba', livery: 'Chatham Dockyard' },
  { reg: 'A7-ALY', typeId: 'a350-900', airlineId: 'qr', livery: 'Standard' },
  { reg: 'G-UZHM', typeId: 'a320neo', airlineId: 'u2', livery: 'Standard' },
  { reg: 'G-DRTA', typeId: 'b737-800', airlineId: 'ls', livery: 'Standard' },
  { reg: 'EI-DWG', typeId: 'b737-800', airlineId: 'fr', livery: 'Standard' },
  { reg: 'G-BNLX', typeId: 'b747-400', airlineId: 'ba', livery: 'Chatham Dockyard', notes: 'Retired' },
  { reg: 'D-ABYF', typeId: 'b747-8i', airlineId: 'lh', livery: 'Named “Sachsen-Anhalt”' },
  { reg: 'LX-VCG', typeId: 'b747-8f', airlineId: 'cv', livery: 'Standard' },
  { reg: '9V-SNC', typeId: 'b777-300er', airlineId: 'sq', livery: 'Standard' },
  { reg: 'A6-ENI', typeId: 'b777-300er', airlineId: 'ek', livery: 'Standard' },
  { reg: 'G-VAHH', typeId: 'b787-9', airlineId: 'vs', livery: 'Standard' },
  { reg: 'PH-BKA', typeId: 'b787-10', airlineId: 'kl', livery: '100 Years KLM', specialLivery: true },
  { reg: 'PH-EZM', typeId: 'e190', airlineId: 'wa', livery: 'Standard' },
  { reg: 'G-LMTE', typeId: 'atr72-600', airlineId: 'lm', livery: 'Standard' },
  { reg: 'G-BOAC', typeId: 'concorde', airlineId: 'ba', livery: 'Landor (preserved)', notes: 'Preserved, Runway Visitor Park, Manchester' },
  { reg: 'XH558', typeId: 'vulcan-b2', airlineId: 'vttst', livery: 'Camouflage', notes: 'Grounded since 2015' },
  { reg: 'ZJ914', typeId: 'typhoon', airlineId: 'raf', livery: 'Display scheme' },
  { reg: 'ZM166', typeId: 'f35b', airlineId: 'raf', livery: 'Standard' },
  { reg: 'ZM414', typeId: 'a400m', airlineId: 'raf', livery: 'Standard' },
  { reg: 'PA474', typeId: 'lancaster', airlineId: 'bbmf', livery: 'Wartime scheme' },
  { reg: 'TF-FIU', typeId: 'b757-200', airlineId: 'fi', livery: 'Hekla Aurora', specialLivery: true },
  { reg: 'G-STBA', typeId: 'b777-300er', airlineId: 'ba', livery: 'Chatham Dockyard' },
  { reg: 'G-WUKM', typeId: 'a321neo', airlineId: 'w9', livery: 'Standard' },
  { reg: 'YL-ABL', typeId: 'a220-300', airlineId: 'bt', livery: 'Standard' },
];

export const typeById = Object.fromEntries(aircraftTypes.map((t) => [t.id, t])) as Record<string, AircraftType>;
export const airlineById = Object.fromEntries(airlines.map((a) => [a.id, a])) as Record<string, Airline>;
export const airportById = Object.fromEntries(airports.map((a) => [a.id, a])) as Record<string, Airport>;
export const manufacturerById = Object.fromEntries(manufacturers.map((m) => [m.id, m])) as Record<string, Manufacturer>;
export const registrationByReg = Object.fromEntries(registrations.map((r) => [r.reg, r])) as Record<string, Registration>;

export function anyAirport(id: string) {
  const a = airportById[id];
  if (a) return { id: a.id, iata: a.iata, city: a.city, lat: a.lat, lon: a.lon, name: a.name };
  const r = routeAirports.find((x) => x.id === id);
  return r ? { ...r, name: r.city } : undefined;
}

export function typeLabel(typeId: string) {
  const t = typeById[typeId];
  if (!t) return typeId;
  return `${manufacturerById[t.manufacturerId]?.name ?? ''} ${t.variant}`.trim();
}
