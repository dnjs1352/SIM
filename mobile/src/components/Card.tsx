import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface CardProps {
  readonly title: string;
  readonly subtitle?: string;
  /** 제목 오른쪽에 표시할 보조 요소(버튼 등). */
  readonly accessory?: ReactNode;
  readonly children: ReactNode;
}

/** 대시보드 섹션을 감싸는 카드. */
export function Card({ title, subtitle, accessory, children }: CardProps) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text style={[styles.title, { color: theme.text }]} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text> : null}
        </View>
        {accessory}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titles: { flex: 1, gap: 2 },
  title: { fontSize: 17, fontWeight: '700' },
  subtitle: { fontSize: 13 },
});
