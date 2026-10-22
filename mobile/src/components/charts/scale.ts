/**
 * 축 최댓값으로 쓸 "보기 좋은" 수(1, 2, 2.5, 5 × 10^k)를 반환한다.
 * 반환값은 항상 value 이상이며 최소 1이다.
 */
export function niceCeiling(value: number): number {
  if (!Number.isFinite(value) || value <= 1) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = [1, 2, 2.5, 5, 10].find((candidate) => normalized <= candidate + 1e-9) ?? 10;
  return step * magnitude;
}

/** 0부터 max까지 같은 간격의 눈금 값 count+1개. */
export function axisTicks(max: number, count = 4): number[] {
  return Array.from({ length: count + 1 }, (_, index) => (max / count) * index);
}

/** 막대가 많을 때 x축 라벨이 겹치지 않도록 몇 개마다 하나씩 표시할지 정한다. */
export function labelStride(itemCount: number, availableWidth: number, minLabelWidth = 28): number {
  if (itemCount <= 0 || availableWidth <= 0) return 1;
  return Math.max(1, Math.ceil((itemCount * minLabelWidth) / availableWidth));
}
