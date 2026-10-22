import { View } from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { formatNumber } from '../../format';
import { useTheme } from '../../theme/useTheme';
import { useMeasuredWidth } from '../useMeasuredWidth';
import { axisTicks, labelStride, niceCeiling } from './scale';

interface BarChartProps {
  readonly values: readonly number[];
  readonly labels: readonly string[];
  readonly height?: number;
  readonly accessibilityLabel: string;
}

const PADDING = { top: 16, right: 4, bottom: 22, left: 30 };

/** 세로 막대 차트. 컨테이너 너비에 맞춰 그리고, 막대가 많으면 x축 라벨을 건너뛴다. */
export function BarChart({ values, labels, height = 180, accessibilityLabel }: BarChartProps) {
  const theme = useTheme();
  const [width, onLayout] = useMeasuredWidth();
  const plotWidth = Math.max(0, width - PADDING.left - PADDING.right);
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const maxValue = niceCeiling(Math.max(0, ...values));
  const slot = values.length > 0 ? plotWidth / values.length : 0;
  const barWidth = Math.max(2, slot * 0.64);
  const stride = labelStride(values.length, plotWidth);
  const y = (value: number) => PADDING.top + plotHeight * (1 - value / maxValue);
  const showValues = slot >= 22;

  return (
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
          {values.map((value, index) => {
            const x = PADDING.left + slot * index + (slot - barWidth) / 2;
            return (
              <G key={labels[index] ?? index}>
                <Rect x={x} y={y(value)} width={barWidth} height={Math.max(0, y(0) - y(value))} rx={3} fill={theme.chartPrimary} />
                {showValues && value > 0 ? (
                  <SvgText x={x + barWidth / 2} y={y(value) - 4} fontSize={10} fill={theme.text} textAnchor="middle">
                    {value}
                  </SvgText>
                ) : null}
                {index % stride === 0 ? (
                  <SvgText x={x + barWidth / 2} y={height - 6} fontSize={10} fill={theme.textMuted} textAnchor="middle">
                    {labels[index]}
                  </SvgText>
                ) : null}
              </G>
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}
