import { DEFAULT_PARAMS } from '../defaults';
import { runSimulation } from '../engine';
import type { SimulationParams } from '../types';
import { InvalidParamsError } from '../validation';

const line = (...times: number[]) =>
  times.map((meanProcessMinutes, index) => ({ id: `s${index}`, name: `공정 ${index + 1}`, meanProcessMinutes }));

const deterministic = (overrides: Partial<SimulationParams>): SimulationParams => ({
  ...DEFAULT_PARAMS,
  variability: 0,
  ...overrides,
});

describe('runSimulation', () => {
  it('matches the closed-form result for a lightly loaded single station', () => {
    // 10분마다 투입, 가공 5분 → 대기 없이 모두 완료되고 가동률 50%.
    const result = runSimulation(deterministic({ stations: line(5), productsPerShift: 10, shiftMinutes: 100 }));
    expect(result.completedProducts).toBe(10);
    expect(result.completionRate).toBe(1);
    expect(result.averageLeadTimeMinutes).toBeCloseTo(5);
    expect(result.averageWaitingMinutes).toBeCloseTo(0);
    expect(result.stations[0].utilization).toBeCloseTo(0.5);
    expect(result.stations[0].maxQueueLength).toBe(0);
  });

  it('limits output to bottleneck capacity and finds the bottleneck', () => {
    // 2분마다 투입하지만 가운데 공정이 8분 → 병목. 480분 동안 최대 60개 처리.
    const result = runSimulation(deterministic({ stations: line(1, 8, 1), productsPerShift: 240, shiftMinutes: 480 }));
    expect(result.bottleneckIndex).toBe(1);
    expect(result.stations[1].utilization).toBeCloseTo(1, 2);
    expect(result.completedProducts).toBeLessThanOrEqual(60);
    expect(result.completedProducts).toBeGreaterThanOrEqual(58);
    expect(result.stations[1].maxQueueLength).toBeGreaterThan(100);
    expect(result.stations[2].maxQueueLength).toBe(0);
  });

  it('conserves products: completed + in process + waiting = total', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const result = runSimulation({ ...DEFAULT_PARAMS, productsPerShift: 150, seed });
      expect(result.completedProducts + result.inProcessProducts + result.waitingProducts).toBe(result.totalProducts);
    }
  });

  it('keeps hourly and cumulative series consistent with completions', () => {
    const result = runSimulation({ ...DEFAULT_PARAMS, shiftMinutes: 450 });
    expect(result.hourlyProduction).toHaveLength(8);
    expect(result.hourlyProduction.reduce((sum, count) => sum + count, 0)).toBe(result.completedProducts);
    expect(result.cumulativeProduction.at(-1)).toBe(result.completedProducts);
    expect(result.plannedCumulativeReleases.at(-1)).toBe(result.totalProducts);
    expect(result.plannedCumulativeReleases[0]).toBe(Math.ceil(60 / (450 / DEFAULT_PARAMS.productsPerShift)));
  });

  it('is reproducible for the same seed and differs across seeds', () => {
    const first = runSimulation(DEFAULT_PARAMS);
    const second = runSimulation(DEFAULT_PARAMS);
    const other = runSimulation({ ...DEFAULT_PARAMS, seed: 7 });
    expect(second).toEqual(first);
    expect(other.averageLeadTimeMinutes).not.toBe(first.averageLeadTimeMinutes);
  });

  it('keeps every station metric within valid bounds', () => {
    const result = runSimulation({ ...DEFAULT_PARAMS, productsPerShift: 400, variability: 1 });
    for (const station of result.stations) {
      expect(station.utilization).toBeGreaterThanOrEqual(0);
      expect(station.utilization).toBeLessThanOrEqual(1);
      expect(station.averageQueueLength).toBeGreaterThanOrEqual(0);
      expect(station.averageQueueLength).toBeLessThanOrEqual(station.maxQueueLength);
    }
  });

  it('reports null averages when nothing completes', () => {
    const result = runSimulation(deterministic({ stations: line(200), productsPerShift: 1, shiftMinutes: 60 }));
    expect(result.completedProducts).toBe(0);
    expect(result.inProcessProducts).toBe(1);
    expect(result.averageLeadTimeMinutes).toBeNull();
    expect(result.stations[0].utilization).toBeCloseTo(1);
  });

  it('rejects invalid parameters', () => {
    expect(() => runSimulation({ ...DEFAULT_PARAMS, stations: [] })).toThrow(InvalidParamsError);
    expect(() => runSimulation({ ...DEFAULT_PARAMS, productsPerShift: 1.5 })).toThrow(InvalidParamsError);
  });
});
