import type { Flight } from '@/types/domain';
import { anyAirport } from '@/data/catalog';
import { bearing, haversineKm, interpolateGC } from './geo';
import type { FlightDataProvider, FlightQuery } from './types';

/** [flight number, airline, type, registration | '', origin ICAO, destination ICAO] */
const ROUTES: [string, string, string, string, string, string][] = [
  ['EK17', 'ek', 'a380-800', 'A6-EED', 'OMDB', 'EGCC'], ['EK18', 'ek', 'a380-800', '', 'EGCC', 'OMDB'], ['EK19', 'ek', 'b777-300er', 'A6-ENI', 'OMDB', 'EGCC'],
  ['EK1', 'ek', 'a380-800', '', 'OMDB', 'EGLL'], ['EK201', 'ek', 'a380-800', '', 'OMDB', 'KJFK'], ['EK404', 'ek', 'a380-800', '', 'OMDB', 'WSSS'],
  ['QR23', 'qr', 'a350-900', 'A7-ALY', 'OTHH', 'EGCC'], ['QR7', 'qr', 'a350-1000', '', 'OTHH', 'EGLL'], ['QR945', 'qr', 'b787-9', '', 'OTHH', 'WSSS'],
  ['BA117', 'ba', 'a350-1000', 'G-XWBD', 'EGLL', 'KJFK'], ['BA283', 'ba', 'b777-300er', 'G-STBA', 'EGLL', 'KLAX'], ['BA11', 'ba', 'a380-800', '', 'EGLL', 'WSSS'],
  ['BA1388', 'ba', 'a320neo', '', 'EGLL', 'EGCC'], ['BA1395', 'ba', 'a320neo', '', 'EGCC', 'EGLL'], ['BA478', 'ba', 'a321neo', '', 'EGLL', 'LEBL'],
  ['VS127', 'vs', 'b787-9', 'G-VAHH', 'EGCC', 'KBOS'], ['VS3', 'vs', 'a350-1000', '', 'EGLL', 'KJFK'], ['VS251', 'vs', 'b787-9', '', 'EGLL', 'VHHH'],
  ['SQ52', 'sq', 'a350-900', '', 'WSSS', 'EGCC'], ['SQ322', 'sq', 'a380-800', '', 'WSSS', 'EGLL'], ['SQ318', 'sq', 'b777-300er', '9V-SNC', 'WSSS', 'EGLL'], ['SQ634', 'sq', 'b787-10', '', 'WSSS', 'RJTT'],
  ['LH941', 'lh', 'a320neo', '', 'EDDF', 'EGCC'], ['LH400', 'lh', 'b747-8i', 'D-ABYF', 'EDDF', 'KJFK'], ['LH778', 'lh', 'a350-900', '', 'EDDF', 'WSSS'],
  ['KL1070', 'kl', 'b737-800', '', 'EHAM', 'EGCC'], ['KL1073', 'wa', 'e190', 'PH-EZM', 'EGCC', 'EHAM'], ['KL641', 'kl', 'b787-10', 'PH-BKA', 'EHAM', 'KJFK'], ['KL835', 'kl', 'b777-300er', '', 'EHAM', 'WSSS'],
  ['CV7442', 'cv', 'b747-8f', 'LX-VCG', 'ELLX', 'EGCC'], ['CV7311', 'cv', 'b747-8f', '', 'ELLX', 'KORD'],
  ['LS811', 'ls', 'b737-800', 'G-DRTA', 'EGCC', 'LEPA'], ['LS835', 'ls', 'b737-800', '', 'EGCC', 'GCTS'], ['LS823', 'ls', 'b737-800', '', 'EGCC', 'LEAL'], ['LS1121', 'ls', 'a321neo', '', 'EGCC', 'LEMG'], ['LS887', 'ls', 'b737-800', '', 'LPFR', 'EGCC'],
  ['U22161', 'u2', 'a320neo', 'G-UZHM', 'EGCC', 'LEBL'], ['U22217', 'u2', 'a320neo', '', 'EGCC', 'LIRF'], ['U28103', 'u2', 'a321neo', '', 'EGKK', 'LGAV'], ['U2407', 'u2', 'a320neo', '', 'EGKK', 'EGPH'],
  ['FR3152', 'fr', 'b737-800', 'EI-DWG', 'EGCC', 'EIDW'], ['FR8341', 'fr', 'b737-8', '', 'EGCC', 'LPPT'], ['FR1886', 'fr', 'b737-800', '', 'EGBB', 'LEMD'], ['FR206', 'fr', 'b737-8', '', 'EIDW', 'EGKK'],
  ['LM431', 'lm', 'atr72-600', 'G-LMTE', 'EGCC', 'EGPF'], ['LM96', 'lm', 'atr72-600', '', 'EGPH', 'EGAA'],
  ['FI440', 'fi', 'b757-200', 'TF-FIU', 'BIKF', 'EGCC'], ['FI614', 'fi', 'b757-200', '', 'BIKF', 'KJFK'],
  ['W95701', 'w9', 'a321neo', 'G-WUKM', 'EGKK', 'LGAV'], ['BT652', 'bt', 'a220-300', 'YL-ABL', 'EVRA', 'EGCC'],
  ['BGA114', 'ati', 'beluga-xl', '', 'EDHI', 'LFBO'],
  ['TK1994', 'private', 'a321neo', '', 'LTFM', 'EGCC'], ['AF1669', 'private', 'a220-300', '', 'LFPG', 'EGCC'], ['SK541', 'private', 'a320neo', '', 'EKCH', 'EGCC'], ['OS461', 'private', 'a320neo', '', 'LOWW', 'EGLL'],
  ['EY15', 'private', 'b787-9', '', 'OMAA', 'EGCC'], ['AI162', 'private', 'b777-300er', '', 'VIDP', 'EGLL'], ['CA937', 'private', 'b777-300er', '', 'ZBAA', 'EGLL'],
  ['UA901', 'private', 'b777-200er', '', 'KSFO', 'EGLL'], ['DL31', 'private', 'a350-900', '', 'KATL', 'EGLL'], ['AA80', 'private', 'b777-200er', '', 'KJFK', 'EGLL'], ['AC854', 'private', 'b787-9', '', 'CYYZ', 'EGLL'],
  ['SA234', 'private', 'a350-900', '', 'FAOR', 'EGLL'], ['LA8084', 'private', 'b787-9', '', 'SBGR', 'EGLL'], ['QF1', 'private', 'a380-800', '', 'YSSY', 'WSSS'],
  ['CX255', 'private', 'a350-1000', '', 'VHHH', 'EGLL'], ['KE907', 'private', 'b777-300er', '', 'RKSI', 'EGLL'], ['TG910', 'private', 'a350-900', '', 'VTBS', 'EGLL'], ['NH211', 'private', 'b787-9', '', 'RJTT', 'EGLL'],
  ['JL43', 'private', 'b777-300er', '', 'RJTT', 'EGLL'], ['EK385', 'ek', 'a380-800', '', 'OMDB', 'VTBS'], ['SQ26', 'sq', 'a380-800', '', 'WSSS', 'EDDF'],
  ['LX318', 'private', 'a220-300', '', 'LSZH', 'EGLL'], ['LH2500', 'lh', 'a320neo', '', 'EDDM', 'EGCC'],
];

const CALLSIGN_PREFIX: Record<string, string> = { ek: 'UAE', qr: 'QTR', ba: 'BAW', vs: 'VIR', sq: 'SIA', lh: 'DLH', kl: 'KLM', wa: 'KLC', cv: 'CLX', ls: 'EXS', u2: 'EZY', fr: 'RYR', lm: 'LOG', fi: 'ICE', w9: 'WUK', bt: 'BTI', ati: 'BGA' };

function seeded(i: number) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/** Time compression so movement is visible on screen (10× real time). */
const TIME_SCALE = 10;

export class SimulatedFlightProvider implements FlightDataProvider {
  readonly mode = 'demo' as const;
  readonly attribution = 'Simulated demo traffic — not real aircraft positions';
  private t0 = Date.now();

  snapshot(now = Date.now()): Flight[] {
    const out: Flight[] = [];
    ROUTES.forEach(([fn, airlineId, typeId, reg, o, d], i) => {
      const A = anyAirport(o), B = anyAirport(d);
      if (!A || !B) return;
      const distKm = haversineKm(A.lat, A.lon, B.lat, B.lon);
      const durationMs = (distKm / 850) * 3600_000 + 30 * 60_000;
      const phase = seeded(i);
      const elapsed = ((now - this.t0) * TIME_SCALE) / durationMs;
      const p = 0.02 + ((phase + elapsed) % 1) * 0.96;
      const pos = interpolateGC(A.lat, A.lon, B.lat, B.lon, p);
      const ahead = interpolateGC(A.lat, A.lon, B.lat, B.lon, Math.min(1, p + 0.002));
      const climbEnd = Math.min(0.15, 250 / distKm);
      const descStart = Math.max(0.85, 1 - 300 / distKm);
      const cruise = distKm < 1200 ? 30000 + Math.round(seeded(i + 7) * 6) * 1000 : 35000 + Math.round(seeded(i + 7) * 6) * 1000;
      let alt = cruise, status: Flight['status'] = 'cruising', gs = 440 + Math.round(seeded(i + 3) * 60);
      if (p < climbEnd) { alt = Math.round((cruise * (p / climbEnd)) / 100) * 100; status = 'climbing'; gs = 260 + (gs - 260) * (p / climbEnd); }
      else if (p > descStart) {
        const f = (1 - p) / (1 - descStart);
        alt = Math.round((cruise * f) / 100) * 100;
        status = f < 0.25 ? 'approach' : 'descending';
        gs = 160 + (gs - 160) * f;
      }
      out.push({
        id: `sim_${fn}`,
        callsign: (CALLSIGN_PREFIX[airlineId] ?? fn.slice(0, 2)) + fn.replace(/^[A-Z0-9]{2}/, ''),
        flightNumber: fn,
        airlineId,
        typeId,
        registration: reg || undefined,
        originId: o,
        destinationId: d,
        lat: pos.lat,
        lon: pos.lon,
        altitudeFt: Math.max(1500, alt),
        groundSpeedKt: Math.round(gs),
        heading: Math.round(bearing(pos.lat, pos.lon, ahead.lat, ahead.lon)),
        status,
        progress: p,
        simulated: true,
        updatedAt: now,
      });
    });
    return out;
  }

  subscribe(_q: FlightQuery, cb: (f: Flight[]) => void) {
    cb(this.snapshot());
    const t = setInterval(() => cb(this.snapshot()), 1500);
    return () => clearInterval(t);
  }
}
