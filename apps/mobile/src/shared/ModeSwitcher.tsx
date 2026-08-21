import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius, spacing, typography} from '@sorapay/ui';
import {useAppStore, type AppMode} from '../state/appStore';

export function ModeSwitcher() {
  const {mode, merchantEnabled, setMode} = useAppStore();
  const options: AppMode[] = merchantEnabled ? ['customer', 'merchant'] : ['customer'];
  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {options.map(option => {
        const selected = option === mode;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{selected}}
            key={option}
            onPress={() => setMode(option)}
            style={[styles.option, selected && styles.selected]}>
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {option === 'customer' ? 'Customer' : 'Merchant'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {backgroundColor: colors.roseSoft, borderRadius: radius.md, flexDirection: 'row', padding: spacing.xs},
  option: {alignItems: 'center', borderRadius: radius.sm, flex: 1, minHeight: 38, justifyContent: 'center'},
  selected: {backgroundColor: colors.surface},
  label: {...typography.label, color: colors.inkMuted},
  selectedLabel: {color: colors.roseDark},
});
