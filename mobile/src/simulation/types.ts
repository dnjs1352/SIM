/** 생산라인의 공정(기계) 하나에 대한 설정. */
export interface StationConfig {
  /** 리스트 렌더링과 수정에 쓰는 고유 ID. */
  readonly id: string;
  readonly name: string;
  /** 제품 1개당 평균 가공 시간(분). */
  readonly meanProcessMinutes: number;
}

/** 시뮬레이션 입력 파라미터. */
export interface SimulationParams {
  /** 제품이 순서대로 거치는 공정 목록(직렬 생산라인). */
  readonly stations: readonly StationConfig[];
  /** 근무 시간 동안 투입할 제품 수. 근무 시간에 걸쳐 균등한 간격으로 투입된다. */
  readonly productsPerShift: number;
  /** 근무(시뮬레이션) 시간(분). */
  readonly shiftMinutes: number;
  /** 가공 시간의 변동계수(0이면 결정적). */
  readonly variability: number;
  /** 난수 시드. 같은 시드와 파라미터는 항상 같은 결과를 만든다. */
  readonly seed: number;
}

/** 공정별 집계 결과. */
export interface StationResult {
  readonly id: string;
  readonly name: string;
  readonly meanProcessMinutes: number;
  /** 가공을 마친 제품 수. */
  readonly processed: number;
  /** 가동률(0~1): 근무 시간 중 가공에 쓴 시간의 비율. */
  readonly utilization: number;
  /** 시간 가중 평균 대기열 길이. */
  readonly averageQueueLength: number;
  readonly maxQueueLength: number;
  /** 이 공정에서 가공을 시작한 제품의 평균 대기 시간(분). 시작한 제품이 없으면 0. */
  readonly averageWaitMinutes: number;
}

/** 시뮬레이션 전체 결과. */
export interface SimulationResult {
  readonly params: SimulationParams;
  readonly totalProducts: number;
  readonly completedProducts: number;
  /** 근무 종료 시점에 가공 중인 제품 수. */
  readonly inProcessProducts: number;
  /** 근무 종료 시점에 공정 앞 대기열에 있는 제품 수. */
  readonly waitingProducts: number;
  /** 완료율(0~1). */
  readonly completionRate: number;
  /** 시간당 완료 제품 수. */
  readonly throughputPerHour: number;
  /** 완료 제품의 평균 리드타임(투입→완료, 분). 완료 제품이 없으면 null. */
  readonly averageLeadTimeMinutes: number | null;
  /** 완료 제품의 평균 순수 가공 시간 합계(분). 완료 제품이 없으면 null. */
  readonly averageProcessingMinutes: number | null;
  /** 완료 제품의 평균 총 대기 시간(분). 완료 제품이 없으면 null. */
  readonly averageWaitingMinutes: number | null;
  /** 1시간 구간별 완료 수. 마지막 구간은 60분보다 짧을 수 있다. */
  readonly hourlyProduction: readonly number[];
  /** hourlyProduction의 누적합. */
  readonly cumulativeProduction: readonly number[];
  /** 각 1시간 구간이 끝날 때까지 계획상 투입된 누적 제품 수(비교 기준선). */
  readonly plannedCumulativeReleases: readonly number[];
  readonly stations: readonly StationResult[];
  /** 가동률이 가장 높은 공정의 인덱스. */
  readonly bottleneckIndex: number;
  readonly eventsProcessed: number;
}
