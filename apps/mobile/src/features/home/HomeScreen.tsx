import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ArrowUpRight, QrCode, ScanLine, Store} from 'lucide-react-native';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Button, colors, radius, spacing, typography} from '@sorapay/ui';
import type {MainTabsParams, RootStackParams} from '../../app/navigation';
import {ModeSwitcher} from '../../shared/ModeSwitcher';
import {Screen} from '../../shared/Screen';
import {useAppStore} from '../../state/appStore';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParams, 'Home'>,
  NativeStackScreenProps<RootStackParams>
>;

export function HomeScreen({navigation}: Props) {
  const {mode, merchantEnabled, activateMerchant} = useAppStore();
  return (
    <Screen>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>SORA PAY</Text><Text style={styles.greeting}>Good morning</Text></View>
        <View style={styles.network}><View style={styles.dot} /><Text style={styles.networkText}>Testnet</Text></View>
      </View>
      <ModeSwitcher />
      {mode === 'customer' ? (
        <>
          <View style={styles.balanceBand}>
            <Text style={styles.balanceLabel}>Available balance</Text>
            <Text style={styles.balance}>1,248.75 <Text style={styles.balanceAsset}>XLM</Text></Text>
            <Text style={styles.address}>GDRX...N7KQ</Text>
          </View>
          <View style={styles.primaryActions}>
            <Pressable onPress={() => navigation.navigate('Scan')} style={styles.action}>
              <View style={styles.actionIcon}><ScanLine color={colors.rose} size={26} /></View>
              <Text style={styles.actionTitle}>Scan QR</Text><Text style={styles.actionHint}>Pay a merchant</Text>
            </Pressable>
            <Pressable disabled style={[styles.action, styles.disabledAction]}>
              <View style={styles.actionIcon}><ArrowUpRight color={colors.inkMuted} size={26} /></View>
              <Text style={styles.actionTitle}>Tap to Pay</Text><Text style={styles.actionHint}>Coming after QR</Text>
            </Pressable>
          </View>
          {!merchantEnabled && (
            <View style={styles.merchantBand}>
              <Store color={colors.amberDark} size={24} />
              <View style={styles.merchantCopy}><Text style={styles.bandTitle}>Accept payments</Text><Text style={styles.bandBody}>Add merchant capability to this account.</Text></View>
              <Button tone="ghost" onPress={activateMerchant}>Activate</Button>
            </View>
          )}
        </>
      ) : (
        <>
          <View style={styles.merchantHero}>
            <Text style={styles.balanceLabel}>TODAY</Text><Text style={styles.merchantTotal}>342.00 XLM</Text><Text style={styles.bandBody}>8 confirmed payments</Text>
          </View>
          <Button icon={<QrCode color={colors.black} size={20} />} onPress={() => navigation.navigate('MerchantRequest')}>Generate payment request</Button>
          <View style={styles.statusLine}><View style={styles.successDot} /><Text style={styles.bandBody}>Receiving address verified</Text></View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  eyebrow: {...typography.label, color: colors.rose, letterSpacing: 0},
  greeting: {...typography.title, color: colors.ink},
  network: {alignItems: 'center', borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm},
  dot: {backgroundColor: colors.amber, borderRadius: radius.round, height: 8, width: 8},
  networkText: {...typography.label, color: colors.ink},
  balanceBand: {backgroundColor: colors.black, borderRadius: radius.md, gap: spacing.sm, padding: spacing.xl},
  balanceLabel: {...typography.label, color: colors.amber},
  balance: {fontSize: 32, lineHeight: 40, fontWeight: '700', color: colors.ink},
  balanceAsset: {fontSize: 16, fontWeight: '600'},
  address: {...typography.mono, color: '#CFC4C7'},
  primaryActions: {flexDirection: 'row', gap: spacing.md},
  action: {backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, flex: 1, gap: spacing.xs, minHeight: 150, padding: spacing.lg},
  disabledAction: {opacity: 0.58},
  actionIcon: {alignItems: 'center', backgroundColor: colors.roseSoft, borderRadius: radius.md, height: 48, justifyContent: 'center', marginBottom: spacing.sm, width: 48},
  actionTitle: {...typography.label, color: colors.ink},
  actionHint: {fontSize: 13, lineHeight: 18, color: colors.inkMuted},
  merchantBand: {alignItems: 'center', backgroundColor: colors.amberSoft, borderRadius: radius.md, flexDirection: 'row', gap: spacing.md, padding: spacing.md},
  merchantCopy: {flex: 1},
  bandTitle: {...typography.label, color: colors.ink},
  bandBody: {fontSize: 13, lineHeight: 18, color: colors.inkMuted},
  merchantHero: {backgroundColor: colors.surface, borderBottomColor: colors.amber, borderBottomWidth: 4, borderRadius: radius.md, gap: spacing.sm, padding: spacing.xl},
  merchantTotal: {fontSize: 30, lineHeight: 38, fontWeight: '700', color: colors.ink},
  statusLine: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  successDot: {backgroundColor: colors.success, borderRadius: radius.round, height: 9, width: 9},
});
