import type { Flight } from '@/types/domain';
import { config } from '@/services/config';
import type { FlightDataProvider, FlightQuery } from './types';

/**
 * Production adapter: polls the AeroVerse backend `flights` function, which
 * proxies a LICENSED flight-data provider (keys held server-side). Military
 * and blocked (e.g. privacy-requested) aircraft are filtered by the backend.
 */
export class BackendFlightProvider implements FlightDataProvider {
  readonly mode = 'live' as const;
  readonly attribution = 'Flight data © licensed provider';

  subscribe(q: FlightQuery, cb: (f: Flight[]) => void) {
    let stopped = false;
    const tick = async () => {
      try {
        const b = q.bounds;
        const qs = b ? `?n=${b.north}&s=${b.south}&e=${b.east}&w=${b.west}` : '';
        const res = await fetch(`${config.apiBaseUrl}/flights${qs}`);
        if (res.ok && !stopped) cb(((await res.json()) as Flight[]).map((f) => ({ ...f, simulated: false })));
      } catch {
        // keep last state; UI shows stale indicator via updatedAt
      }
    };
    tick();
    const t = setInterval(tick, 5000);
    return () => { stopped = true; clearInterval(t); };
  }
}
