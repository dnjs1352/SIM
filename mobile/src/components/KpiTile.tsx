import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface KpiTileProps {
  readonly label: string;
  readonly value: string;
  readonly caption?: string;
}

/** 핵심 지표 하나를 크게 보여주는 타일. 2열 그리드에 배치한다. */
export function KpiTile({ label, value, caption }: KpiTileProps) {
  const theme = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${label} ${value}${caption ? `, ${caption}` : ''}`}
      style={[styles.tile, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.text }]} adjustsFontSizeToFit numberOfLines={1}>
        {value}
      </Text>
      {caption ? <Text style={[styles.caption, { color: theme.textMuted }]}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 4,
  },
  label: { fontSize: 13 },
  value: { fontSize: 24, fontWeight: '700', fontVariant: ['tabular-nums'] },
  caption: { fontSize: 12 },
});
