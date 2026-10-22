import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { formatNumber } from '../../format';
import { useTheme } from '../../theme/useTheme';
import { useMeasuredWidth } from '../useMeasuredWidth';
import { axisTicks, labelStride, niceCeiling } from './scale';

interface LineChartProps {
  readonly values: readonly number[];
  /** 비교용 기준선(예: 계획 누적 투입량). values와 길이가 같아야 한다. */
  readonly reference?: readonly number[];
  readonly labels: readonly string[];
  readonly valueLabel: string;
  readonly referenceLabel?: string;
  readonly height?: number;
  readonly accessibilityLabel: string;
}

const PADDING = { top: 12, right: 12, bottom: 22, left: 34 };

/** 실적과 기준선을 함께 그리는 꺾은선 차트. */
export function LineChart({
  values,
  reference,
  labels,
  valueLabel,
  referenceLabel,
  height = 190,
  accessibilityLabel,
}: LineChartProps) {
  const theme = useTheme();
  const [width, onLayout] = useMeasuredWidth();
  const plotWidth = Math.max(0, width - PADDING.left - PADDING.right);
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const maxValue = niceCeiling(Math.max(0, ...values, ...(reference ?? [])));
  const stride = labelStride(values.length, plotWidth);
  // 0시점(원점)에서 시작해 각 구간 끝에 점을 찍는다.
  const x = (index: number) => PADDING.left + (plotWidth * (index + 1)) / Math.max(1, values.length);
  const y = (value: number) => PADDING.top + plotHeight * (1 - value / maxValue);
  const toPath = (series: readonly number[]) =>
    `M ${PADDING.left} ${y(0)} ` + series.map((value, index) => `L ${x(index)} ${y(value)}`).join(' ');

  return (
    <View style={styles.container}>
      <View onLayout={onLayout} accessible accessibilityLabel={accessibilityLabel} style={{ height }}>
        {width > 0 ? (
          <Svg width={width} height={height}>
            {axisTicks(maxValue).map((tick) => (
              <G key={tick}>
                <Line x1={PADDING.left} x2={width - PADDING.right} y1={y(tick)} y2={y(tick)} stroke={theme.gridLine} strokeWidth={1} />
                <SvgText x={PADDING.left - 6} y={y(tick) + 4} fontSize={10} fill={theme.textMuted} textAnchor="end">
                  {formatNumber(tick, 0)}
                </SvgText>
              </G>
            ))}
            {reference ? (
              <Path d={toPath(reference)} stroke={theme.textMuted} strokeWidth={1.5} strokeDasharray="5 4" fill="none" />
            ) : null}
            <Path d={toPath(values)} stroke={theme.chartPrimary} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
            {values.map((value, index) => (
              <G key={labels[index] ?? index}>
                <Circle cx={x(index)} cy={y(value)} r={3} fill={theme.chartPrimary} />
                {index % stride === 0 ? (
                  <SvgText x={x(index)} y={height - 6} fontSize={10} fill={theme.textMuted} textAnchor="middle">
                    {labels[index]}
                  </SvgText>
                ) : null}
              </G>
            ))}
          </Svg>
        ) : null}
      </View>
      <View style={styles.legend}>
        <LegendItem color={theme.chartPrimary} label={valueLabel} />
        {referenceLabel ? <LegendItem color={theme.textMuted} label={referenceLabel} dashed /> : null}
      </View>
    </View>
  );
}

function LegendItem({ color, label, dashed = false }: { color: string; label: string; dashed?: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { borderColor: color, borderStyle: dashed ? 'dashed' : 'solid' }]} />
      <Text style={[styles.legendText, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  legend: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 18, borderTopWidth: 2.5 },
  legendText: { fontSize: 12 },
});
