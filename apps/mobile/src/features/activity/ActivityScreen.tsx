import {StyleSheet, Text, View} from 'react-native';
import {CheckCircle2, History} from 'lucide-react-native';
import {colors, radius, spacing, typography} from '@sorapay/ui';
import {Screen} from '../../shared/Screen';
import {useAppStore} from '../../state/appStore';

export function ActivityScreen() {
  const receipts = useAppStore(state => state.receipts);
  return (
    <Screen>
      <Text style={styles.title}>Activity</Text>
      {receipts.length === 0 ? (
        <View style={styles.empty}><History color={colors.inkMuted} size={34} /><Text style={styles.emptyTitle}>No payments yet</Text><Text style={styles.body}>Confirmed and pending payments will appear here.</Text></View>
      ) : receipts.map(receipt => (
        <View key={receipt.intentId} style={styles.item}><CheckCircle2 color={colors.success} size={24} /><View style={styles.copy}><Text style={styles.itemTitle}>{receipt.merchantName}</Text><Text style={styles.body}>Confirmed - Testnet</Text></View><Text style={styles.amount}>-{receipt.amount} {receipt.assetCode}</Text></View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {...typography.title, color: colors.ink},
  empty: {alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, gap: spacing.sm, padding: spacing.xxl},
  emptyTitle: {...typography.label, color: colors.ink},
  body: {fontSize: 13, lineHeight: 18, color: colors.inkMuted, textAlign: 'center'},
  item: {alignItems: 'center', backgroundColor: colors.surface, borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.lg},
  copy: {flex: 1},
  itemTitle: {...typography.label, color: colors.ink},
  amount: {...typography.label, color: colors.ink},
});
