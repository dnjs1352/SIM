import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface NumberFieldProps {
  readonly label: string;
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  /** 허용할 소수점 자릿수. 0이면 정수만. */
  readonly decimals?: number;
  readonly unit?: string;
  readonly error?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const roundTo = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/**
 * −/+ 스테퍼와 직접 입력을 함께 제공하는 숫자 입력.
 * 입력 중에는 자유롭게 타이핑하고, 포커스를 잃을 때 범위로 보정해 확정한다.
 */
export function NumberField({ label, value, onChange, min, max, step, decimals = 0, unit, error }: NumberFieldProps) {
  const theme = useTheme();
  const [text, setText] = useState(String(value));
  const [syncedValue, setSyncedValue] = useState(value);

  // 외부에서 값이 바뀌면(스테퍼, 초기화) 렌더 중에 표시 문자열을 맞춘다(effect 없이 한 번에 반영).
  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(String(value));
  }

  const commit = (next: number) => {
    const normalized = roundTo(clamp(next, min, max), decimals);
    setText(String(normalized));
    if (normalized !== value) onChange(normalized);
  };

  const commitText = () => {
    const parsed = Number(text.replace(',', '.'));
    if (text.trim() === '' || !Number.isFinite(parsed)) {
      setText(String(value));
      return;
    }
    commit(parsed);
  };

  const stepper = (direction: -1 | 1) => {
    const disabled = direction < 0 ? value <= min : value >= max;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} ${direction < 0 ? '감소' : '증가'}`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        hitSlop={6}
        onPress={() => commit(value + direction * step)}
        style={({ pressed }) => [
          styles.stepper,
          { backgroundColor: theme.surfaceMuted, opacity: disabled ? 0.4 : pressed ? 0.6 : 1 },
        ]}
      >
        <Text style={[styles.stepperText, { color: theme.text }]}>{direction < 0 ? '−' : '+'}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
          {label}
        </Text>
        <View style={styles.controls}>
          {stepper(-1)}
          <TextInput
            accessibilityLabel={label}
            value={text}
            onChangeText={setText}
            onEndEditing={commitText}
            onSubmitEditing={commitText}
            keyboardType={decimals > 0 ? 'decimal-pad' : 'number-pad'}
            returnKeyType="done"
            selectTextOnFocus
            style={[
              styles.input,
              { color: theme.text, borderColor: error ? theme.danger : theme.border, backgroundColor: theme.background },
            ]}
          />
          {stepper(1)}
          {unit ? <Text style={[styles.unit, { color: theme.textMuted }]}>{unit}</Text> : null}
        </View>
      </View>
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  label: { flex: 1, fontSize: 15 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepper: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepperText: { fontSize: 20, fontWeight: '600' },
  input: {
    width: 72,
    height: 34,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  unit: { width: 22, fontSize: 13 },
  error: { fontSize: 12 },
});
