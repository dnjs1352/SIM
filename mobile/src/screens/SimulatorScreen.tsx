import { useMemo, useReducer, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DEFAULT_PARAMS,
  hasErrors,
  runSimulation,
  validateParams,
  type SimulationResult,
} from '../simulation';
import { paramsReducer } from '../state/paramsReducer';
import { useTheme } from '../theme/useTheme';
import { ParameterPanel } from './ParameterPanel';
import { ResultsDashboard } from './ResultsDashboard';

/**
 * 메인 화면: 조건 입력 → 실행 → 결과 대시보드.
 * 시뮬레이션은 수 ms 안에 끝나는 순수 함수라 별도 스레드 없이 버튼 이벤트에서 바로 실행한다.
 */
export function SimulatorScreen() {
  const theme = useTheme();
  const [params, dispatch] = useReducer(paramsReducer, DEFAULT_PARAMS);
  // 첫 화면부터 기본 조건의 결과를 보여준다.
  const [result, setResult] = useState<SimulationResult>(() => runSimulation(DEFAULT_PARAMS));
  const errors = useMemo(() => validateParams(params), [params]);
  const invalid = hasErrors(errors);
  // reducer는 변경 시 항상 새 객체를 만들기 때문에 참조 비교로 결과와 입력이 어긋났는지 알 수 있다.
  const isStale = result.params !== params;

  const run = () => {
    if (invalid) return;
    setResult(runSimulation(params));
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]} accessibilityRole="header">
            생산라인 시뮬레이터
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            공정 조건을 바꾸고 실행해 병목과 처리량을 확인하세요.
          </Text>
        </View>

        <ParameterPanel params={params} errors={errors} dispatch={dispatch} />

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: invalid }}
          accessibilityHint="현재 조건으로 시뮬레이션을 실행합니다"
          disabled={invalid}
          onPress={run}
          style={({ pressed }) => [
            styles.runButton,
            { backgroundColor: theme.accent, opacity: invalid ? 0.4 : pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[styles.runButtonText, { color: theme.accentText }]}>
            {isStale ? '시뮬레이션 실행' : '다시 실행'}
          </Text>
        </Pressable>

        {isStale ? (
          <Text style={[styles.staleNotice, { color: theme.warning }]}>
            조건이 바뀌었습니다. 아래 결과는 이전 조건 기준입니다.
          </Text>
        ) : null}

        <ResultsDashboard result={result} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 16, paddingBottom: 48, gap: 16 },
  header: { gap: 4, paddingTop: 8 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14 },
  runButton: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  runButtonText: { fontSize: 17, fontWeight: '700' },
  staleNotice: { fontSize: 13, textAlign: 'center' },
});
