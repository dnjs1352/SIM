/** 0 이상 1 미만의 균등 분포 난수를 반환하는 함수 타입. */
export type RandomSource = () => number;

/**
 * Mulberry32 기반 시드 난수 생성기.
 * 같은 시드는 항상 같은 수열을 만들어 시뮬레이션 결과를 재현 가능하게 한다.
 */
export function createRng(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller 변환으로 표준 정규 분포 표본을 만든다. */
export function sampleStandardNormal(random: RandomSource): number {
  // 1 - random()은 (0, 1] 범위라 log(0)을 피한다.
  const u1 = 1 - random();
  const u2 = random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * 평균과 변동계수(CV)로 지정한 로그정규 분포 표본.
 * 가공 시간처럼 항상 양수이고 오른쪽 꼬리가 긴 값을 표현하기에 적합하다.
 * CV가 0이면 평균값을 그대로 반환한다(결정적 모드).
 */
export function sampleLogNormal(
  random: RandomSource,
  mean: number,
  coefficientOfVariation: number,
): number {
  if (coefficientOfVariation <= 0) return mean;
  const sigmaSquared = Math.log(1 + coefficientOfVariation ** 2);
  const mu = Math.log(mean) - sigmaSquared / 2;
  return Math.exp(mu + Math.sqrt(sigmaSquared) * sampleStandardNormal(random));
}
