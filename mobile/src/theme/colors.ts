/** 라이트/다크 모드 색상 토큰. 컴포넌트는 hex 값을 직접 쓰지 않고 이 토큰만 사용한다. */
export interface Palette {
  readonly background: string;
  readonly surface: string;
  readonly surfaceMuted: string;
  readonly border: string;
  readonly text: string;
  readonly textMuted: string;
  readonly accent: string;
  readonly accentText: string;
  readonly success: string;
  readonly warning: string;
  readonly danger: string;
  readonly chartPrimary: string;
  readonly chartSecondary: string;
  readonly gridLine: string;
}

export const lightPalette: Palette = {
  background: '#F3F5F8',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF1F5',
  border: '#DDE2EA',
  text: '#16202E',
  textMuted: '#5D6B7E',
  accent: '#2F6FEB',
  accentText: '#FFFFFF',
  success: '#1F9D63',
  warning: '#D98A00',
  danger: '#D64545',
  chartPrimary: '#2F6FEB',
  chartSecondary: '#8FB1F5',
  gridLine: '#E6EAF0',
};

export const darkPalette: Palette = {
  background: '#0E131B',
  surface: '#171E29',
  surfaceMuted: '#202937',
  border: '#2C3646',
  text: '#E8EDF4',
  textMuted: '#97A4B6',
  accent: '#5B8DF6',
  accentText: '#0E131B',
  success: '#3CC488',
  warning: '#F0A92E',
  danger: '#F06A6A',
  chartPrimary: '#5B8DF6',
  chartSecondary: '#35558F',
  gridLine: '#253041',
};
