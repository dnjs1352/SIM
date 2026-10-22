import { DEFAULT_PARAMS, LIMITS } from '../../simulation';
import { paramsReducer } from '../paramsReducer';

describe('paramsReducer', () => {
  it('adds stations with unique ids up to the limit', () => {
    let state = DEFAULT_PARAMS;
    for (let i = 0; i < 20; i++) state = paramsReducer(state, { type: 'addStation' });
    expect(state.stations).toHaveLength(LIMITS.stations.max);
    expect(new Set(state.stations.map((station) => station.id)).size).toBe(state.stations.length);
  });

  it('does not reuse ids after removal', () => {
    const removed = paramsReducer(DEFAULT_PARAMS, { type: 'removeStation', id: 'station-5' });
    const added = paramsReducer(paramsReducer(removed, { type: 'removeStation', id: 'station-2' }), { type: 'addStation' });
    expect(added.stations.at(-1)?.id).toBe('station-5');
    expect(new Set(added.stations.map((station) => station.id)).size).toBe(added.stations.length);
  });

  it('keeps at least one station', () => {
    let state = DEFAULT_PARAMS;
    for (const station of DEFAULT_PARAMS.stations) state = paramsReducer(state, { type: 'removeStation', id: station.id });
    expect(state.stations).toHaveLength(1);
  });

  it('updates only the targeted station time', () => {
    const state = paramsReducer(DEFAULT_PARAMS, { type: 'setStationTime', id: 'station-2', value: 9 });
    expect(state.stations[1].meanProcessMinutes).toBe(9);
    expect(state.stations[0]).toBe(DEFAULT_PARAMS.stations[0]);
  });

  it('renames only the targeted station', () => {
    const state = paramsReducer(DEFAULT_PARAMS, { type: 'renameStation', id: 'station-3', name: '용접' });
    expect(state.stations[2].name).toBe('용접');
    expect(state.stations[2].meanProcessMinutes).toBe(DEFAULT_PARAMS.stations[2].meanProcessMinutes);
    expect(state.stations[0]).toBe(DEFAULT_PARAMS.stations[0]);
  });

  it('resets to defaults', () => {
    const changed = paramsReducer(DEFAULT_PARAMS, { type: 'setSeed', value: 1 });
    expect(paramsReducer(changed, { type: 'reset' })).toBe(DEFAULT_PARAMS);
  });
});
