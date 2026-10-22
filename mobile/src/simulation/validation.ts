import type { SimulationParams } from './types';

/** 파라미터 허용 범위. UI 입력 컴포넌트도 같은 값을 쓴다. */
export const LIMITS = {
  stations: { min: 1, max: 10 },
  productsPerShift: { min: 1, max: 5000 },
  shiftMinutes: { min: 10, max: 1440 },
  meanProcessMinutes: { min: 0.1, max: 240 },
  stationNameLength: { min: 1, max: 20 },
  variability: { min: 0, max: 1 },
} as const;

/** 공정 하나의 필드별 오류. */
export interface StationErrors {
  readonly name?: string;
  readonly meanProcessMinutes?: string;
}

export type ValidationErrors = Partial<Record<'stations' | 'productsPerShift' | 'shiftMinutes' | 'variability' | 'seed', string>> & {
  /** 공정 ID별 오류 메시지. */
  readonly stationErrors?: Readonly<Record<string, StationErrors>>;
};

const inRange = (value: number, range: { min: number; max: number }) =>
  Number.isFinite(value) && value >= range.min && value <= range.max;

/** 파라미터를 검증하고 필드별 오류 메시지를 반환한다. 오류가 없으면 빈 객체. */
export function validateParams(params: SimulationParams): ValidationErrors {
  const errors: { -readonly [K in keyof ValidationErrors]: ValidationErrors[K] } = {};
  const { stations: stationRange, productsPerShift, shiftMinutes, meanProcessMinutes, stationNameLength, variability } = LIMITS;

  if (params.stations.length < stationRange.min || params.stations.length > stationRange.max) {
    errors.stations = `공정은 ${stationRange.min}~${stationRange.max}개여야 합니다.`;
  }
  const stationErrors: Record<string, StationErrors> = {};
  for (const station of params.stations) {
    const nameLength = station.name.trim().length;
    const name =
      nameLength < stationNameLength.min
        ? '공정명을 입력하세요.'
        : nameLength > stationNameLength.max
          ? `공정명은 ${stationNameLength.max}자 이하여야 합니다.`
          : undefined;
    const time = inRange(station.meanProcessMinutes, meanProcessMinutes)
      ? undefined
      : `가공 시간은 ${meanProcessMinutes.min}~${meanProcessMinutes.max}분이어야 합니다.`;
    if (name || time) stationErrors[station.id] = { name, meanProcessMinutes: time };
  }
  if (Object.keys(stationErrors).length > 0) errors.stationErrors = stationErrors;

  if (!Number.isInteger(params.productsPerShift) || !inRange(params.productsPerShift, productsPerShift)) {
    errors.productsPerShift = `투입량은 ${productsPerShift.min}~${productsPerShift.max} 사이의 정수여야 합니다.`;
  }
  if (!inRange(params.shiftMinutes, shiftMinutes)) {
    errors.shiftMinutes = `근무 시간은 ${shiftMinutes.min}~${shiftMinutes.max}분이어야 합니다.`;
  }
  if (!inRange(params.variability, variability)) {
    errors.variability = `변동계수는 ${variability.min}~${variability.max} 사이여야 합니다.`;
  }
  if (!Number.isSafeInteger(params.seed)) {
    errors.seed = '시드는 정수여야 합니다.';
  }
  return errors;
}

export const hasErrors = (errors: ValidationErrors): boolean => Object.keys(errors).length > 0;

/** 잘못된 파라미터가 엔진에 들어온 경우를 나타내는 오류. */
export class InvalidParamsError extends Error {
  constructor(readonly errors: ValidationErrors) {
    super('유효하지 않은 시뮬레이션 파라미터입니다.');
    this.name = 'InvalidParamsError';
  }
}
