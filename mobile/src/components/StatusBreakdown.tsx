import { StyleSheet, Text, View } from 'react-native';
import { formatNumber } from '../format';
import { useTheme } from '../theme/useTheme';

interface StatusBreakdownProps {
  readonly completed: number;
  readonly inProcess: number;
  readonly waiting: number;
}

/** 근무 종료 시점의 제품 상태(완료/가공 중/대기)를 누적 막대로 보여준다. */
export function StatusBreakdown({ completed, inProcess, waiting }: StatusBreakdownProps) {
  const theme = useTheme();
  const total = Math.max(1, completed + inProcess + waiting);
  const segments = [
    { label: '완료', value: completed, color: theme.success },
    { label: '가공 중', value: inProcess, color: theme.chartPrimary },
    { label: '대기', value: waiting, color: theme.warning },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: theme.surfaceMuted }]}>
        {segments.map((segment) =>
          segment.value > 0 ? (
            <View key={segment.label} style={{ flex: segment.value / total, backgroundColor: segment.color }} />
          ) : null,
        )}
      </View>
      <View style={styles.legend}>
        {segments.map((segment) => (
          <View key={segment.label} style={styles.legendItem} accessible accessibilityLabel={`${segment.label} ${segment.value}개`}>
            <View style={[styles.dot, { backgroundColor: segment.color }]} />
            <Text style={[styles.legendLabel, { color: theme.textMuted }]}>{segment.label}</Text>
            <Text style={[styles.legendValue, { color: theme.text }]}>{formatNumber(segment.value, 0)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  track: { flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden' },
  legend: { flexDirection: 'row', justifyContent: 'space-between' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 13 },
  legendValue: { fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
});
