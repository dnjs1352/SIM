import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { formatPercent } from '../../format';
import { useTheme } from '../../theme/useTheme';

interface CompletionRingProps {
  /** 0~1 사이 비율. */
  readonly ratio: number;
  readonly size?: number;
  readonly label: string;
}

/** 완료율을 원형 게이지로 보여준다. 95% 이상 녹색, 70% 이상 주황, 그 외 빨강. */
export function CompletionRing({ ratio, size = 132, label }: CompletionRingProps) {
  const theme = useTheme();
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, ratio));
  const color = clamped >= 0.95 ? theme.success : clamped >= 0.7 ? theme.warning : theme.danger;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${label} ${formatPercent(clamped)}`}
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.surfaceMuted} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
          // 12시 방향에서 시계 방향으로 채운다.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.center}>
          <Text style={[styles.value, { color: theme.text }]}>{formatPercent(clamped)}</Text>
          <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 24, fontWeight: '700', fontVariant: ['tabular-nums'] },
  label: { fontSize: 12 },
});
