import { StyleSheet, View } from 'react-native';

import { colors, radii } from '../constants/theme';

/** Thin horizontal progress track, 0-1 `ratio`. Purely presentational. */
export function ProgressBar({ ratio, height = 6 }: { ratio: number; height?: number }) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0));

  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
});
