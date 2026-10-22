import { useColorScheme } from 'react-native';
import { darkPalette, lightPalette, type Palette } from './colors';

/** 시스템 색상 모드에 맞는 팔레트를 반환한다. */
export function useTheme(): Palette {
  return useColorScheme() === 'dark' ? darkPalette : lightPalette;
}
