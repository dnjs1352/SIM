import { DEFAULT_PARAMS } from '../defaults';
import { hasErrors, validateParams } from '../validation';

describe('validateParams', () => {
  it('accepts the default parameters', () => {
    expect(hasErrors(validateParams(DEFAULT_PARAMS))).toBe(false);
  });

  it('reports each invalid field', () => {
    const errors = validateParams({
      stations: [{ id: 'bad', name: 'x', meanProcessMinutes: 0 }],
      productsPerShift: 0,
      shiftMinutes: Number.NaN,
      variability: 2,
      seed: 0.5,
    });
    expect(errors.stationErrors?.bad?.meanProcessMinutes).toBeDefined();
    expect(errors.stationErrors?.bad?.name).toBeUndefined();
    expect(errors.productsPerShift).toBeDefined();
    expect(errors.shiftMinutes).toBeDefined();
    expect(errors.variability).toBeDefined();
    expect(errors.seed).toBeDefined();
  });

  it('rejects blank and overly long station names', () => {
    const errors = validateParams({
      ...DEFAULT_PARAMS,
      stations: [
        { id: 'blank', name: '   ', meanProcessMinutes: 1 },
        { id: 'long', name: '가'.repeat(21), meanProcessMinutes: 1 },
        { id: 'ok', name: '가'.repeat(20), meanProcessMinutes: 1 },
      ],
    });
    expect(errors.stationErrors?.blank?.name).toBe('공정명을 입력하세요.');
    expect(errors.stationErrors?.long?.name).toBeDefined();
    expect(errors.stationErrors?.ok).toBeUndefined();
  });

  it('rejects too many stations', () => {
    const stations = Array.from({ length: 11 }, (_, index) => ({ id: `${index}`, name: `${index}`, meanProcessMinutes: 1 }));
    expect(validateParams({ ...DEFAULT_PARAMS, stations }).stations).toBeDefined();
  });
});
