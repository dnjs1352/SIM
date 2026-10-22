import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NumberField } from '../components/NumberField';
import { LIMITS, type StationConfig, type StationErrors } from '../simulation';
import { useTheme } from '../theme/useTheme';

interface StationEditorProps {
  readonly station: StationConfig;
  /** 0부터 시작하는 공정 순서. */
  readonly index: number;
  readonly errors?: StationErrors;
  readonly canRemove: boolean;
  readonly onRename: (name: string) => void;
  readonly onChangeTime: (value: number) => void;
  readonly onRemove: () => void;
}

/**
 * 공정 하나의 편집 행.
 * 윗줄은 순번·공정명·삭제, 아랫줄은 가공 시간이다.
 * 작은 화면(iPhone SE, 320pt)에서도 이름 칸이 충분히 넓도록 두 줄로 나눴다.
 */
export function StationEditor({ station, index, errors, canRemove, onRename, onChangeTime, onRemove }: StationEditorProps) {
  const theme = useTheme();
  const displayName = station.name.trim() || `공정 ${index + 1}`;

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <View style={styles.nameRow}>
        <Text style={[styles.order, { color: theme.textMuted }]}>{index + 1}</Text>
        <TextInput
          accessibilityLabel={`${index + 1}번 공정명`}
          value={station.name}
          onChangeText={onRename}
          placeholder="공정명"
          placeholderTextColor={theme.textMuted}
          maxLength={LIMITS.stationNameLength.max}
          returnKeyType="done"
          autoCorrect={false}
          style={[
            styles.nameInput,
            {
              color: theme.text,
              backgroundColor: theme.background,
              borderColor: errors?.name ? theme.danger : theme.border,
            },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${displayName} 공정 삭제`}
          accessibilityState={{ disabled: !canRemove }}
          disabled={!canRemove}
          hitSlop={8}
          onPress={onRemove}
          style={({ pressed }) => [styles.remove, { opacity: !canRemove ? 0.3 : pressed ? 0.5 : 1 }]}
        >
          <Text style={[styles.removeText, { color: theme.danger }]}>✕</Text>
        </Pressable>
      </View>
      {errors?.name ? <Text style={[styles.error, { color: theme.danger }]}>{errors.name}</Text> : null}
      <NumberField
        label="가공 시간"
        accessibilityLabel={`${displayName} 가공 시간`}
        unit="분"
        decimals={1}
        value={station.meanProcessMinutes}
        min={LIMITS.meanProcessMinutes.min}
        max={LIMITS.meanProcessMinutes.max}
        step={0.5}
        error={errors?.meanProcessMinutes}
        onChange={onChangeTime}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  order: { width: 18, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  nameInput: {
    flex: 1,
    // 웹(react-native-web)에서 TextInput의 기본 너비가 flex 축소를 막지 않도록 한다.
    minWidth: 0,
    height: 36,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    fontSize: 15,
    fontWeight: '600',
  },
  remove: { width: 28, alignItems: 'center' },
  removeText: { fontSize: 16, fontWeight: '600' },
  error: { fontSize: 12, marginLeft: 26 },
});
