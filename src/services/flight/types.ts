import type { Flight } from '@/types/domain';

export interface FlightQuery {
  bounds?: { north: number; south: number; east: number; west: number };
}

/**
 * Replaceable flight-data provider. Implementations:
 *  - SimulatedFlightProvider (demo; clearly labelled simulated positions)
 *  - BackendFlightProvider (production; AeroVerse backend proxies a properly
 *    licensed ADS-B / flight-data API. Keys stay server-side.)
 */
export interface FlightDataProvider {
  readonly mode: 'demo' | 'live';
  readonly attribution: string;
  subscribe(query: FlightQuery, cb: (flights: Flight[]) => void): () => void;
}
