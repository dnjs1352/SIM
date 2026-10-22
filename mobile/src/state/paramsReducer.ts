import { DEFAULT_PARAMS, LIMITS, type SimulationParams, type StationConfig } from '../simulation';

export type ParamsAction =
  | { readonly type: 'setProductsPerShift'; readonly value: number }
  | { readonly type: 'setShiftMinutes'; readonly value: number }
  | { readonly type: 'setVariability'; readonly value: number }
  | { readonly type: 'setSeed'; readonly value: number }
  | { readonly type: 'setStationTime'; readonly id: string; readonly value: number }
  | { readonly type: 'addStation' }
  | { readonly type: 'removeStation'; readonly id: string }
  | { readonly type: 'reset' };

/** 기존 ID와 겹치지 않는 다음 공정 ID를 만든다. */
function nextStationId(stations: readonly StationConfig[]): string {
  const used = stations.map((station) => Number(/^station-(\d+)$/.exec(station.id)?.[1] ?? 0));
  return `station-${Math.max(0, ...used) + 1}`;
}

/** 시뮬레이션 파라미터 편집 상태를 갱신하는 순수 reducer. */
export function paramsReducer(state: SimulationParams, action: ParamsAction): SimulationParams {
  switch (action.type) {
    case 'setProductsPerShift':
      return { ...state, productsPerShift: action.value };
    case 'setShiftMinutes':
      return { ...state, shiftMinutes: action.value };
    case 'setVariability':
      return { ...state, variability: action.value };
    case 'setSeed':
      return { ...state, seed: action.value };
    case 'setStationTime':
      return {
        ...state,
        stations: state.stations.map((station) =>
          station.id === action.id ? { ...station, meanProcessMinutes: action.value } : station,
        ),
      };
    case 'addStation': {
      if (state.stations.length >= LIMITS.stations.max) return state;
      const station: StationConfig = {
        id: nextStationId(state.stations),
        name: `공정 ${state.stations.length + 1}`,
        meanProcessMinutes: 3,
      };
      return { ...state, stations: [...state.stations, station] };
    }
    case 'removeStation':
      if (state.stations.length <= LIMITS.stations.min) return state;
      return { ...state, stations: state.stations.filter((station) => station.id !== action.id) };
    case 'reset':
      return DEFAULT_PARAMS;
  }
}
