/** 소수점 자릿수를 지정해 숫자를 표시용 문자열로 만든다. 불필요한 끝자리 0은 지운다. */
export function formatNumber(value: number, maximumFractionDigits = 1): string {
  return value.toLocaleString('ko-KR', { maximumFractionDigits });
}

export function formatPercent(ratio: number): string {
  return `${formatNumber(ratio * 100, 1)}%`;
}

/** 분 단위 시간. 값이 없으면 대시를 표시한다. */
export function formatMinutes(value: number | null): string {
  return value === null ? '—' : `${formatNumber(value, 1)}분`;
}
