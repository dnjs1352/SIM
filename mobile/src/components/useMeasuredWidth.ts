import { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

/** 뷰의 실제 너비를 측정한다. 차트가 화면 너비(아이폰 SE~Pro Max)에 맞춰 그려지도록 한다. */
export function useMeasuredWidth(): [number, (event: LayoutChangeEvent) => void] {
  const [width, setWidth] = useState(0);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);
    setWidth((previous) => (previous === next ? previous : next));
  }, []);
  return [width, onLayout];
}
