import { StyleSheet, Text, View } from 'react-native';

import { MockModeBadge } from '../components/MockModeBadge';

// Placeholder home screen. The real category list (with progress
// indicators, lock badges, etc.) is built in the UI stage -- this stage
// only needs the app to boot through expo-router and prove the
// lib/purchases.ts + components wiring works.
export default function CategoryListScreen() {
  return (
    <View style={styles.container}>
      <MockModeBadge />
      <Text style={styles.title}>Interview Playbook</Text>
      <Text style={styles.subtitle}>Category list UI is built in the next stage.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});
