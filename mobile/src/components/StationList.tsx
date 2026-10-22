import { StyleSheet, Text, View } from 'react-native';
import { formatMinutes, formatNumber, formatPercent } from '../format';
import type { StationResult } from '../simulation';
import { useTheme } from '../theme/useTheme';

interface StationListProps {
  readonly stations: readonly StationResult[];
  readonly bottleneckIndex: number;
}

/** 공정별 가동률 막대와 처리량·대기 지표. 병목 공정은 강조한다. */
export function StationList({ stations, bottleneckIndex }: StationListProps) {
  const theme = useTheme();
  return (
    <View style={styles.list}>
      {stations.map((station, index) => {
        const isBottleneck = index === bottleneckIndex;
        const barColor = isBottleneck ? theme.danger : theme.chartPrimary;
        return (
          <View
            key={station.id}
            accessible
            accessibilityLabel={
              `${index + 1}번 ${station.name}${isBottleneck ? ', 병목' : ''}. 가동률 ${formatPercent(station.utilization)}, ` +
              `처리 ${station.processed}개, 평균 대기열 ${formatNumber(station.averageQueueLength)}개`
            }
            style={styles.item}
          >
            <View style={styles.headerRow}>
              <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                {index + 1}. {station.name}
              </Text>
              {isBottleneck ? (
                <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                  <Text style={styles.badgeText}>병목</Text>
                </View>
              ) : null}
              <Text style={[styles.utilization, { color: theme.text }]}>{formatPercent(station.utilization)}</Text>
            </View>
            <View style={[styles.track, { backgroundColor: theme.surfaceMuted }]}>
              <View style={[styles.fill, { width: `${station.utilization * 100}%`, backgroundColor: barColor }]} />
            </View>
            <Text style={[styles.meta, { color: theme.textMuted }]}>
              처리 {formatNumber(station.processed, 0)}개 · 평균 가공 {formatMinutes(station.meanProcessMinutes)} · 대기열 평균{' '}
              {formatNumber(station.averageQueueLength)} / 최대 {station.maxQueueLength} · 평균 대기{' '}
              {formatMinutes(station.averageWaitMinutes)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  item: { gap: 6 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: 15, fontWeight: '600' },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  utilization: { fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  meta: { fontSize: 12, lineHeight: 17 },
});
