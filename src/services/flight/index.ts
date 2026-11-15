import { serviceModes } from '@/services/config';
import { BackendFlightProvider } from './BackendFlightProvider';
import { SimulatedFlightProvider } from './SimulatedFlightProvider';
import type { FlightDataProvider } from './types';

export * from './types';
export * from './geo';

export const flightProvider: FlightDataProvider =
  serviceModes.flights === 'live' ? new BackendFlightProvider() : new SimulatedFlightProvider();
