import type { SimulationParams, StationConfig } from './types';

/** 기존 Python 버전(main.py)과 같은 기본 조건: 공정 5개, 하루 100개, 480분. */
export const DEFAULT_STATIONS: readonly StationConfig[] = [
  { id: 'station-1', name: '절단', meanProcessMinutes: 3.5 },
  { id: 'station-2', name: '가공', meanProcessMinutes: 4.5 },
  { id: 'station-3', name: '조립', meanProcessMinutes: 5.2 },
  { id: 'station-4', name: '검사', meanProcessMinutes: 3.0 },
  { id: 'station-5', name: '포장', meanProcessMinutes: 2.5 },
];

export const DEFAULT_PARAMS: SimulationParams = {
  stations: DEFAULT_STATIONS,
  productsPerShift: 100,
  shiftMinutes: 480,
  variability: 0.3,
  seed: 42,
};
