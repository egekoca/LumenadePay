import type {ReactNode} from 'react';
import {ScrollView, StyleSheet, type ViewStyle} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, spacing} from '@sorapay/ui';

export function Screen({children, contentStyle}: {children: ReactNode; contentStyle?: ViewStyle}) {
  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.content, contentStyle]}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.canvas},
  content: {flexGrow: 1, padding: spacing.xl, gap: spacing.lg},
});
