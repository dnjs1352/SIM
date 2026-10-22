import { createRng, sampleLogNormal } from '../rng';

describe('createRng', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng(123);
    const b = createRng(123);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });

  it('produces values in [0, 1)', () => {
    const random = createRng(7);
    for (let i = 0; i < 10_000; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('sampleLogNormal', () => {
  it('returns the mean when variability is zero', () => {
    expect(sampleLogNormal(createRng(1), 4.2, 0)).toBe(4.2);
  });

  it('matches the requested mean and coefficient of variation', () => {
    const random = createRng(99);
    const samples = Array.from({ length: 50_000 }, () => sampleLogNormal(random, 5, 0.4));
    const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
    const variance = samples.reduce((sum, value) => sum + (value - mean) ** 2, 0) / samples.length;
    expect(mean).toBeCloseTo(5, 1);
    expect(Math.sqrt(variance) / mean).toBeCloseTo(0.4, 1);
    expect(samples.every((value) => value > 0)).toBe(true);
  });
});
