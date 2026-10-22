import { DEFAULT_PARAMS } from '../defaults';
import { runSimulation } from '../engine';
import { buildInsights } from '../insights';

const stations = (...times: number[]) =>
  times.map((meanProcessMinutes, index) => ({ id: `s${index}`, name: `S${index + 1}`, meanProcessMinutes }));

describe('buildInsights', () => {
  it('reports success when nearly everything completes', () => {
    const result = runSimulation({ ...DEFAULT_PARAMS, variability: 0, stations: stations(2, 2), productsPerShift: 50 });
    const [first] = buildInsights(result);
    expect(first.tone).toBe('success');
  });

  it('names the bottleneck, the capacity shortfall and idle stations under overload', () => {
    const result = runSimulation({ ...DEFAULT_PARAMS, variability: 0, stations: stations(1, 8, 1), productsPerShift: 240 });
    const insights = buildInsights(result);
    expect(insights[0]).toMatchObject({ tone: 'warning' });
    expect(insights[0].message).toContain("'S2'");
    expect(insights.some((insight) => insight.message.includes('최대 약 60개'))).toBe(true);
    expect(insights.some((insight) => insight.tone === 'info' && insight.message.includes("'S3'"))).toBe(true);
  });
});
