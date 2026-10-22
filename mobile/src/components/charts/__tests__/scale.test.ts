import { axisTicks, labelStride, niceCeiling } from '../scale';

describe('niceCeiling', () => {
  it.each([
    [0, 1],
    [1, 1],
    [3, 5],
    [7, 10],
    [11, 20],
    [21, 25],
    [26, 50],
    [100, 100],
    [101, 200],
  ])('niceCeiling(%p) = %p', (input, expected) => {
    expect(niceCeiling(input)).toBe(expected);
  });

  it('handles non-finite input', () => {
    expect(niceCeiling(Number.NaN)).toBe(1);
  });
});

describe('axisTicks', () => {
  it('splits the range evenly', () => {
    expect(axisTicks(20, 4)).toEqual([0, 5, 10, 15, 20]);
  });
});

describe('labelStride', () => {
  it('shows every label when there is room', () => {
    expect(labelStride(8, 320)).toBe(1);
  });

  it('skips labels when crowded', () => {
    expect(labelStride(24, 320)).toBe(3);
  });
});
