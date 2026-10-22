import { StyleSheet, Text, View } from 'react-native';
import type { Insight } from '../simulation/insights';
import { useTheme } from '../theme/useTheme';

/** 결과 해석 문장 목록. 상태(성공/경고/정보)에 따라 왼쪽 강조선 색이 바뀐다. */
export function InsightList({ insights }: { readonly insights: readonly Insight[] }) {
  const theme = useTheme();
  const toneColor = { success: theme.success, warning: theme.warning, info: theme.chartPrimary } as const;
  return (
    <View style={styles.list}>
      {insights.map((insight) => (
        <View
          key={insight.message}
          style={[styles.item, { borderLeftColor: toneColor[insight.tone], backgroundColor: theme.surfaceMuted }]}
        >
          <Text style={[styles.text, { color: theme.text }]}>{insight.message}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  item: { borderLeftWidth: 4, borderRadius: 8, padding: 12 },
  text: { fontSize: 14, lineHeight: 20 },
});
