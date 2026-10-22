import type { Dispatch } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { NumberField } from '../components/NumberField';
import { SegmentedControl } from '../components/SegmentedControl';
import { LIMITS, type SimulationParams, type ValidationErrors } from '../simulation';
import type { ParamsAction } from '../state/paramsReducer';
import { useTheme } from '../theme/useTheme';

const VARIABILITY_OPTIONS = [
  { label: '없음', value: 0 },
  { label: '낮음', value: 0.15 },
  { label: '보통', value: 0.3 },
  { label: '높음', value: 0.6 },
] as const;

const MAX_SEED = 999_999;

interface ParameterPanelProps {
  readonly params: SimulationParams;
  readonly errors: ValidationErrors;
  readonly dispatch: Dispatch<ParamsAction>;
}

/** 생산 조건과 공정 구성을 편집하는 입력 영역. */
export function ParameterPanel({ params, errors, dispatch }: ParameterPanelProps) {
  const theme = useTheme();
  const canAdd = params.stations.length < LIMITS.stations.max;
  const canRemove = params.stations.length > LIMITS.stations.min;
  const variability = VARIABILITY_OPTIONS.some((option) => option.value === params.variability)
    ? params.variability
    : VARIABILITY_OPTIONS[2].value;

  return (
    <>
      <Card
        title="생산 조건"
        accessory={
          <TextButton label="초기화" onPress={() => dispatch({ type: 'reset' })} color={theme.accent} />
        }
      >
        <NumberField
          label="투입량"
          unit="개"
          value={params.productsPerShift}
          min={LIMITS.productsPerShift.min}
          max={LIMITS.productsPerShift.max}
          step={10}
          error={errors.productsPerShift}
          onChange={(value) => dispatch({ type: 'setProductsPerShift', value })}
        />
        <NumberField
          label="근무 시간"
          unit="분"
          value={params.shiftMinutes}
          min={LIMITS.shiftMinutes.min}
          max={LIMITS.shiftMinutes.max}
          step={30}
          error={errors.shiftMinutes}
          onChange={(value) => dispatch({ type: 'setShiftMinutes', value })}
        />
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: theme.text }]}>가공 시간 변동성</Text>
          <SegmentedControl
            accessibilityLabel="가공 시간 변동성"
            options={VARIABILITY_OPTIONS}
            value={variability}
            onChange={(value) => dispatch({ type: 'setVariability', value })}
          />
        </View>
        <View style={styles.seedRow}>
          <View style={styles.seedField}>
            <NumberField
              label="난수 시드"
              value={params.seed}
              min={0}
              max={MAX_SEED}
              step={1}
              error={errors.seed}
              onChange={(value) => dispatch({ type: 'setSeed', value })}
            />
          </View>
          <TextButton
            label="새 시드"
            color={theme.accent}
            onPress={() => dispatch({ type: 'setSeed', value: Math.floor(Math.random() * (MAX_SEED + 1)) })}
          />
        </View>
      </Card>

      <Card
        title="공정 구성"
        subtitle={`제품은 위에서 아래 순서로 ${params.stations.length}개 공정을 거칩니다.`}
        accessory={
          <TextButton label="+ 추가" disabled={!canAdd} color={theme.accent} onPress={() => dispatch({ type: 'addStation' })} />
        }
      >
        {params.stations.map((station, index) => (
          <View key={station.id} style={styles.stationRow}>
            <View style={styles.stationField}>
              <NumberField
                label={`${index + 1}. ${station.name}`}
                unit="분"
                decimals={1}
                value={station.meanProcessMinutes}
                min={LIMITS.meanProcessMinutes.min}
                max={LIMITS.meanProcessMinutes.max}
                step={0.5}
                error={errors.stationErrors?.[station.id]}
                onChange={(value) => dispatch({ type: 'setStationTime', id: station.id, value })}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${station.name} 공정 삭제`}
              accessibilityState={{ disabled: !canRemove }}
              disabled={!canRemove}
              hitSlop={8}
              onPress={() => dispatch({ type: 'removeStation', id: station.id })}
              style={({ pressed }) => [styles.remove, { opacity: !canRemove ? 0.3 : pressed ? 0.5 : 1 }]}
            >
              <Text style={[styles.removeText, { color: theme.danger }]}>✕</Text>
            </Pressable>
          </View>
        ))}
        {errors.stations ? <Text style={{ color: theme.danger }}>{errors.stations}</Text> : null}
      </Card>
    </>
  );
}

interface TextButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly color: string;
  readonly disabled?: boolean;
}

function TextButton({ label, onPress, color, disabled = false }: TextButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: disabled ? 0.35 : pressed ? 0.5 : 1 })}
    >
      <Text style={[styles.textButton, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  fieldLabel: { fontSize: 15 },
  seedRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  seedField: { flex: 1 },
  stationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stationField: { flex: 1 },
  remove: { width: 28, alignItems: 'center' },
  removeText: { fontSize: 16, fontWeight: '600' },
  textButton: { fontSize: 15, fontWeight: '600' },
});
