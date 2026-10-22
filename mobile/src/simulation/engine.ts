import { PriorityQueue } from './priorityQueue';
import { createRng, sampleLogNormal } from './rng';
import type { SimulationParams, SimulationResult, StationResult } from './types';
import { InvalidParamsError, hasErrors, validateParams } from './validation';

type SimEvent =
  | { readonly kind: 'release'; readonly productId: number }
  | { readonly kind: 'finish'; readonly stationIndex: number };

interface ProductState {
  readonly releasedAt: number;
  /** 현재 공정 대기열에 들어온 시각. */
  queuedAt: number;
  totalWait: number;
  totalProcess: number;
}

/** 공정의 실행 중 상태. 대기열은 head 포인터 방식이라 dequeue가 O(1)이다. */
interface StationState {
  readonly queue: number[];
  queueHead: number;
  /** 가공 중인 제품 ID. 유휴 상태면 null. */
  current: number | null;
  currentStartedAt: number;
  busyMinutes: number;
  processed: number;
  started: number;
  totalWaitOfStarted: number;
  /** 대기열 길이의 시간 적분과, 마지막으로 적분을 갱신한 시각. */
  queueArea: number;
  queueAreaUpdatedAt: number;
  maxQueueLength: number;
}

const MINUTES_PER_HOUR = 60;

/**
 * 직렬 생산라인을 이산 이벤트 방식으로 시뮬레이션한다.
 *
 * 모델:
 * - 제품은 근무 시간 동안 균등한 간격으로 첫 공정에 투입된다.
 * - 각 공정은 한 번에 제품 1개를 가공하고, 공정 사이 버퍼는 무제한 FIFO다.
 * - 가공 시간은 공정 평균과 변동계수로 정한 로그정규 분포를 따른다.
 * - 근무 종료 시각에 시뮬레이션을 멈추고 남은 재공품(WIP)을 집계한다.
 *
 * 시간 복잡도: O(E log E). E는 이벤트 수이며 최대 (공정 수 + 1) × 투입 수이다.
 *
 * @throws {InvalidParamsError} 파라미터가 유효하지 않을 때
 */
export function runSimulation(params: SimulationParams): SimulationResult {
  const errors = validateParams(params);
  if (hasErrors(errors)) throw new InvalidParamsError(errors);

  const { stations: configs, productsPerShift, shiftMinutes, variability, seed } = params;
  const random = createRng(seed);
  const events = new PriorityQueue<SimEvent>();
  const products: ProductState[] = [];
  const stations: StationState[] = configs.map(() => ({
    queue: [],
    queueHead: 0,
    current: null,
    currentStartedAt: 0,
    busyMinutes: 0,
    processed: 0,
    started: 0,
    totalWaitOfStarted: 0,
    queueArea: 0,
    queueAreaUpdatedAt: 0,
    maxQueueLength: 0,
  }));

  const hourlyProduction = new Array<number>(Math.ceil(shiftMinutes / MINUTES_PER_HOUR)).fill(0);
  const completed: ProductState[] = [];

  const releaseInterval = shiftMinutes / productsPerShift;
  for (let productId = 0; productId < productsPerShift; productId++) {
    events.push(productId * releaseInterval, { kind: 'release', productId });
  }

  const queueLength = (station: StationState) => station.queue.length - station.queueHead;

  const accumulateQueueArea = (station: StationState, now: number) => {
    station.queueArea += queueLength(station) * (now - station.queueAreaUpdatedAt);
    station.queueAreaUpdatedAt = now;
  };

  const startProcessing = (stationIndex: number, productId: number, now: number) => {
    const station = stations[stationIndex];
    const product = products[productId];
    const wait = now - product.queuedAt;
    product.totalWait += wait;
    station.totalWaitOfStarted += wait;
    station.started++;
    station.current = productId;
    station.currentStartedAt = now;
    const duration = sampleLogNormal(random, configs[stationIndex].meanProcessMinutes, variability);
    events.push(now + duration, { kind: 'finish', stationIndex });
  };

  const arrive = (stationIndex: number, productId: number, now: number) => {
    const station = stations[stationIndex];
    products[productId].queuedAt = now;
    if (station.current === null) {
      startProcessing(stationIndex, productId, now);
      return;
    }
    accumulateQueueArea(station, now);
    station.queue.push(productId);
    station.maxQueueLength = Math.max(station.maxQueueLength, queueLength(station));
  };

  const finish = (stationIndex: number, now: number) => {
    const station = stations[stationIndex];
    const productId = station.current!;
    const product = products[productId];
    const duration = now - station.currentStartedAt;
    station.busyMinutes += duration;
    station.processed++;
    station.current = null;
    product.totalProcess += duration;

    if (stationIndex + 1 < stations.length) {
      arrive(stationIndex + 1, productId, now);
    } else {
      completed.push(product);
      const hour = Math.min(Math.floor(now / MINUTES_PER_HOUR), hourlyProduction.length - 1);
      hourlyProduction[hour]++;
    }

    if (queueLength(station) > 0) {
      accumulateQueueArea(station, now);
      const nextProductId = station.queue[station.queueHead++];
      startProcessing(stationIndex, nextProductId, now);
    }
  };

  let eventsProcessed = 0;
  while ((events.peekPriority() ?? Infinity) <= shiftMinutes) {
    const { priority: now, value: event } = events.pop()!;
    eventsProcessed++;
    if (event.kind === 'release') {
      products[event.productId] = { releasedAt: now, queuedAt: now, totalWait: 0, totalProcess: 0 };
      arrive(0, event.productId, now);
    } else {
      finish(event.stationIndex, now);
    }
  }

  const stationResults: StationResult[] = stations.map((station, index) => {
    accumulateQueueArea(station, shiftMinutes);
    // 근무 종료 시점에 가공 중인 시간도 가동 시간에 포함한다.
    const partialBusy = station.current === null ? 0 : shiftMinutes - station.currentStartedAt;
    const config = configs[index];
    return {
      id: config.id,
      name: config.name.trim(),
      meanProcessMinutes: config.meanProcessMinutes,
      processed: station.processed,
      utilization: Math.min(1, (station.busyMinutes + partialBusy) / shiftMinutes),
      averageQueueLength: station.queueArea / shiftMinutes,
      maxQueueLength: station.maxQueueLength,
      averageWaitMinutes: station.started === 0 ? 0 : station.totalWaitOfStarted / station.started,
    };
  });

  const inProcessProducts = stations.filter((station) => station.current !== null).length;
  const waitingProducts = stations.reduce((sum, station) => sum + queueLength(station), 0);
  const average = (selector: (product: ProductState) => number) =>
    completed.length === 0 ? null : completed.reduce((sum, product) => sum + selector(product), 0) / completed.length;

  let runningTotal = 0;
  const cumulativeProduction = hourlyProduction.map((count) => (runningTotal += count));
  const plannedCumulativeReleases = hourlyProduction.map((_, hour) => {
    const binEnd = Math.min((hour + 1) * MINUTES_PER_HOUR, shiftMinutes);
    return Math.min(productsPerShift, Math.ceil(binEnd / releaseInterval));
  });

  return {
    params,
    totalProducts: productsPerShift,
    completedProducts: completed.length,
    inProcessProducts,
    waitingProducts,
    completionRate: completed.length / productsPerShift,
    throughputPerHour: (completed.length / shiftMinutes) * MINUTES_PER_HOUR,
    averageLeadTimeMinutes: average((product) => product.totalWait + product.totalProcess),
    averageProcessingMinutes: average((product) => product.totalProcess),
    averageWaitingMinutes: average((product) => product.totalWait),
    hourlyProduction,
    cumulativeProduction,
    plannedCumulativeReleases,
    stations: stationResults,
    bottleneckIndex: findBottleneckIndex(stationResults),
    eventsProcessed,
  };
}

/** 가동률이 가장 높은 공정을 병목으로 본다. 가동률이 같으면 평균 대기열이 긴 공정을 고른다. */
export function findBottleneckIndex(stations: readonly StationResult[]): number {
  let best = 0;
  for (let index = 1; index < stations.length; index++) {
    const candidate = stations[index];
    const current = stations[best];
    const utilizationDelta = candidate.utilization - current.utilization;
    if (utilizationDelta > 1e-9 || (Math.abs(utilizationDelta) <= 1e-9 && candidate.averageQueueLength > current.averageQueueLength)) {
      best = index;
    }
  }
  return best;
}
