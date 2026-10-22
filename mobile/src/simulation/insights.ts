import { formatNumber, formatPercent } from '../format';
import type { SimulationResult } from './types';

export type InsightTone = 'success' | 'warning' | 'info';

export interface Insight {
  readonly tone: InsightTone;
  readonly message: string;
}

/** 가동률이 이보다 낮은 공정은 여유 공정으로 본다. */
const IDLE_UTILIZATION = 0.5;
/** 완료율이 이 이상이면 목표 달성으로 본다. */
const ON_TARGET_COMPLETION = 0.95;

/**
 * 결과를 해석해 병목과 개선 방향을 문장으로 만든다.
 * 결정적 순수 함수라 UI와 분리해 테스트할 수 있다.
 */
export function buildInsights(result: SimulationResult): Insight[] {
  const insights: Insight[] = [];
  const bottleneck = result.stations[result.bottleneckIndex];
  // 병목 공정이 쉬지 않고 가공한다고 가정한 근무당 최대 생산량(상한 추정치).
  const capacity = Math.floor(result.params.shiftMinutes / bottleneck.meanProcessMinutes);

  if (result.completionRate >= ON_TARGET_COMPLETION) {
    insights.push({
      tone: 'success',
      message: `투입량의 ${formatPercent(result.completionRate)}를 근무 시간 안에 완료했습니다.`,
    });
  } else {
    insights.push({
      tone: 'warning',
      message:
        `'${bottleneck.name}' 공정이 병목입니다(가동률 ${formatPercent(bottleneck.utilization)}, ` +
        `평균 대기 ${formatNumber(bottleneck.averageQueueLength)}개). ` +
        '이 공정의 가공 시간을 줄이거나 설비를 늘리면 처리량이 가장 크게 늘어납니다.',
    });
  }

  if (capacity < result.totalProducts) {
    insights.push({
      tone: 'warning',
      message:
        `병목 공정 기준으로 근무당 최대 약 ${formatNumber(capacity, 0)}개만 생산할 수 있어 ` +
        `목표 ${formatNumber(result.totalProducts, 0)}개에 미달합니다.`,
    });
  }

  const idle = result.stations.filter((station) => station.utilization < IDLE_UTILIZATION);
  if (idle.length > 0 && idle.length < result.stations.length) {
    insights.push({
      tone: 'info',
      message:
        `${idle.map((station) => `'${station.name}'`).join(', ')} 공정은 가동률이 ` +
        `${formatPercent(IDLE_UTILIZATION)} 미만이라 여유가 있습니다. 인력이나 설비를 병목 공정으로 옮기는 것을 검토하세요.`,
    });
  }
  return insights;
}
