import {Copy, KeyRound, ShieldCheck} from 'lucide-react-native';
import {StyleSheet, Text, View} from 'react-native';
import {colors, radius, spacing, typography} from '@sorapay/ui';
import {Screen} from '../../shared/Screen';

export function WalletScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Wallet</Text>
      <View style={styles.addressCard}><Text style={styles.label}>STELLAR TESTNET ADDRESS</Text><Text style={styles.address}>GDRX...N7KQ</Text><Copy color={colors.rose} size={20} /></View>
      <View style={styles.row}><ShieldCheck color={colors.success} size={24} /><View><Text style={styles.rowTitle}>Device protected</Text><Text style={styles.body}>Signing material never enters JavaScript.</Text></View></View>
      <View style={styles.row}><KeyRound color={colors.amberDark} size={24} /><View><Text style={styles.rowTitle}>Passkey signer</Text><Text style={styles.body}>Biometric approval required for every payment.</Text></View></View>
      <Text style={styles.contract}>Settlement contract: Not deployed</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {...typography.title, color: colors.ink},
  addressCard: {alignItems: 'center', backgroundColor: colors.black, borderRadius: radius.md, flexDirection: 'row', gap: spacing.md, padding: spacing.lg},
  label: {...typography.label, color: colors.amber, flex: 1},
  address: {...typography.mono, color: colors.ink},
  row: {alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.lg},
  rowTitle: {...typography.label, color: colors.ink},
  body: {fontSize: 13, lineHeight: 18, color: colors.inkMuted, flexShrink: 1},
  contract: {...typography.mono, color: colors.inkMuted},
});
