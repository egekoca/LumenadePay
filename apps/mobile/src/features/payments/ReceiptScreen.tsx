import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Check, ExternalLink} from 'lucide-react-native';
import {Linking, StyleSheet, Text, View} from 'react-native';
import {Button, colors, radius, spacing, typography} from '@sorapay/ui';
import type {RootStackParams} from '../../app/navigation';
import {Screen} from '../../shared/Screen';

type Props = NativeStackScreenProps<RootStackParams, 'Receipt'>;

export function ReceiptScreen({route, navigation}: Props) {
  const {receipt} = route.params;
  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.check}><Check color={colors.black} size={34} strokeWidth={3} /></View>
      <View style={styles.center}><Text style={styles.title}>Payment confirmed</Text><Text style={styles.amount}>{receipt.amount} {receipt.assetCode}</Text><Text style={styles.merchant}>to {receipt.merchantName}</Text></View>
      <View style={styles.receipt}>
        <Row label="Network" value="Stellar Testnet" />
        <Row label="Intent ID" value={`${receipt.intentId.slice(0, 12)}...`} mono />
        <Row label="Transaction" value={`${receipt.transactionHash.slice(0, 12)}...`} mono />
        <Row label="Status" value="Confirmed" success />
      </View>
      <Button tone="secondary" icon={<ExternalLink color={colors.ink} size={18} />} onPress={() => Linking.openURL(`https://stellar.expert/explorer/testnet/tx/${receipt.transactionHash}`)}>View on Stellar Explorer</Button>
      <Button onPress={() => navigation.popToTop()}>Done</Button>
    </Screen>
  );
}

function Row({label, value, mono, success}: {label: string; value: string; mono?: boolean; success?: boolean}) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={[styles.value, mono && styles.mono, success && styles.success]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: {alignItems: 'stretch'},
  check: {alignItems: 'center', alignSelf: 'center', backgroundColor: colors.success, borderRadius: radius.round, height: 68, justifyContent: 'center', width: 68},
  center: {alignItems: 'center', gap: spacing.xs},
  title: {...typography.title, color: colors.ink},
  amount: {fontSize: 34, lineHeight: 42, fontWeight: '700', color: colors.ink},
  merchant: {...typography.body, color: colors.inkMuted},
  receipt: {backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.lg},
  row: {alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', minHeight: 54, gap: spacing.md},
  label: {...typography.label, color: colors.inkMuted},
  value: {...typography.label, color: colors.ink, flexShrink: 1},
  mono: {...typography.mono},
  success: {color: colors.success},
});
