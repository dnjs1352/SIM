# 생산라인 시뮬레이터 — iPhone 앱 (Expo)

직렬 생산라인을 이산 이벤트 방식으로 시뮬레이션하고, 병목·처리량·리드타임을 대시보드로 보여주는 iOS 앱입니다.
Expo SDK 58 / React Native 0.88 / TypeScript 기반이며, Mac 없이 **Expo Go**로 아이폰에서 바로 실행할 수 있습니다.

## 아이폰에서 실행하기

1. 아이폰 App Store에서 **Expo Go**를 설치합니다.
2. PC(Windows/macOS/Linux)에서:
   ```bash
   cd mobile
   npm install
   npm start          # = npx expo start
   ```
3. 터미널에 뜬 QR 코드를 아이폰 **카메라 앱**으로 스캔하면 Expo Go에서 앱이 열립니다.
   - PC와 아이폰이 같은 Wi-Fi에 있어야 합니다. 다른 네트워크라면 `npx expo start --tunnel`을 쓰세요.

### 앱스토어 / TestFlight 배포

Apple Developer 계정이 있으면 Xcode 없이 클라우드에서 빌드할 수 있습니다.

```bash
npx eas-cli@latest build --platform ios
npx eas-cli@latest submit --platform ios
```

## 개발 명령

| 명령 | 설명 |
|---|---|
| `npm start` | 개발 서버 실행 |
| `npm test` | 단위 테스트 (Jest) |
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm run lint` | ESLint |
| `npm run web` | 브라우저 미리보기 |

## 시뮬레이션 모델

- 제품은 근무 시간 동안 **균등한 간격**으로 첫 공정에 투입됩니다.
- 각 공정은 한 번에 1개를 가공하고, 공정 사이 버퍼는 무제한 FIFO입니다.
- 가공 시간은 공정별 평균과 변동계수(CV)로 정한 **로그정규 분포**를 따릅니다. CV가 0이면 결정적으로 동작합니다.
- 근무 종료 시점에 멈추고, 완료/가공 중/대기 제품 수를 집계합니다.
- 같은 **시드**와 파라미터는 항상 같은 결과를 냅니다(재현 가능).
- 병목은 **가동률이 가장 높은 공정**으로 판정합니다.

계산량은 O(E log E)입니다(E ≤ (공정 수 + 1) × 투입량). 최대 조건(공정 10개, 5,000개 투입)에서도 수십 ms 안에 끝납니다.

## 폴더 구조

```
mobile/
├── App.tsx                   # 앱 진입점 (SafeAreaProvider + 메인 화면)
└── src/
    ├── simulation/           # UI와 독립된 순수 TypeScript 시뮬레이션 엔진
    │   ├── engine.ts         # 이산 이벤트 시뮬레이션
    │   ├── priorityQueue.ts  # 안정적인 이진 힙 이벤트 큐
    │   ├── rng.ts            # 시드 난수(Mulberry32), 로그정규 표본
    │   ├── validation.ts     # 파라미터 범위 검증
    │   ├── insights.ts       # 결과 해석 문장(병목, 용량 부족, 여유 공정)
    │   └── defaults.ts       # 기본 조건 (공정 5개, 100개, 480분)
    ├── state/paramsReducer.ts  # 입력 상태 reducer
    ├── screens/              # 메인 화면, 입력 패널, 결과 대시보드
    ├── components/           # 카드, 숫자 입력, 차트(SVG) 등
    └── theme/                # 라이트/다크 색상 토큰
```
