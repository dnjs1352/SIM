import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { InsightList } from '../components/InsightList';
import { KpiTile } from '../components/KpiTile';
import { StationList } from '../components/StationList';
import { StatusBreakdown } from '../components/StatusBreakdown';
import { BarChart } from '../components/charts/BarChart';
import { CompletionRing } from '../components/charts/CompletionRing';
import { LineChart } from '../components/charts/LineChart';
import { formatMinutes, formatNumber } from '../format';
import type { SimulationResult } from '../simulation';
import { buildInsights } from '../simulation/insights';
import { useTheme } from '../theme/useTheme';

/** 시뮬레이션 결과 대시보드. 기존 Python 시각화(visualization.py)의 6개 패널을 모바일 세로 화면에 맞게 재구성했다. */
export function ResultsDashboard({ result }: { readonly result: SimulationResult }) {
  const theme = useTheme();
  const insights = useMemo(() => buildInsights(result), [result]);
  const hourLabels = useMemo(() => result.hourlyProduction.map((_, hour) => `${hour + 1}h`), [result]);
  const bottleneck = result.stations[result.bottleneckIndex];

  return (
    <>
      <Card title="요약" subtitle={`투입 ${formatNumber(result.totalProducts, 0)}개 · 근무 ${formatNumber(result.params.shiftMinutes, 0)}분`}>
        <View style={styles.summary}>
          <CompletionRing ratio={result.completionRate} label="완료율" />
          <View style={styles.summaryText}>
            <SummaryRow label="완료" value={`${formatNumber(result.completedProducts, 0)} / ${formatNumber(result.totalProducts, 0)}개`} />
            <SummaryRow label="병목 공정" value={bottleneck.name} valueColor={theme.danger} />
            <SummaryRow label="처리 이벤트" value={formatNumber(result.eventsProcessed, 0)} />
          </View>
        </View>
        <InsightList insights={insights} />
      </Card>

      <View style={styles.kpiGrid}>
        <KpiTile label="시간당 처리량" value={`${formatNumber(result.throughputPerHour)}개`} />
        <KpiTile label="평균 리드타임" value={formatMinutes(result.averageLeadTimeMinutes)} caption="투입 → 완료" />
        <KpiTile label="평균 가공 시간" value={formatMinutes(result.averageProcessingMinutes)} caption="공정 합계" />
        <KpiTile label="평균 대기 시간" value={formatMinutes(result.averageWaitingMinutes)} caption="공정 합계" />
      </View>

      <Card title="시간별 생산량" subtitle="1시간 구간마다 완료된 제품 수">
        <BarChart
          values={result.hourlyProduction}
          labels={hourLabels}
          accessibilityLabel={`시간별 생산량: ${result.hourlyProduction.map((count, hour) => `${hour + 1}시간 ${count}개`).join(', ')}`}
        />
      </Card>

      <Card title="누적 생산량" subtitle="계획 투입량 대비 누적 완료">
        <LineChart
          values={result.cumulativeProduction}
          reference={result.plannedCumulativeReleases}
          labels={hourLabels}
          valueLabel="누적 완료"
          referenceLabel="계획 투입"
          accessibilityLabel={`누적 생산량 최종 ${result.completedProducts}개, 계획 투입 ${result.totalProducts}개`}
        />
      </Card>

      <Card title="근무 종료 시점 제품 상태">
        <StatusBreakdown
          completed={result.completedProducts}
          inProcess={result.inProcessProducts}
          waiting={result.waitingProducts}
        />
      </Card>

      <Card title="공정별 가동률" subtitle="가동률이 가장 높은 공정이 병목입니다.">
        <StationList stations={result.stations} bottleneckIndex={result.bottleneckIndex} />
      </Card>
    </>
  );
}

function SummaryRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: valueColor ?? theme.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  summaryText: { flex: 1, gap: 10 },
  summaryRow: { gap: 2 },
  summaryLabel: { fontSize: 12 },
  summaryValue: { fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
