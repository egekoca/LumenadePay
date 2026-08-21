import {useMutation} from '@tanstack/react-query';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BadgeCheck, Fingerprint} from 'lucide-react-native';
import {StyleSheet, Text, View} from 'react-native';
import {Button, colors, radius, spacing, typography} from '@sorapay/ui';
import type {RootStackParams} from '../../app/navigation';
import {Screen} from '../../shared/Screen';
import {useAppStore} from '../../state/appStore';
import {settleMockPayment} from './mockSettlement';

type Props = NativeStackScreenProps<RootStackParams, 'Confirm'>;

export function PaymentConfirmationScreen({route, navigation}: Props) {
  const {payload} = route.params;
  const addReceipt = useAppStore(state => state.addReceipt);
  const mutation = useMutation({
    mutationFn: () => settleMockPayment(payload),
    onSuccess: receipt => {
      addReceipt(receipt);
      navigation.replace('Receipt', {receipt});
    },
  });
  const recipient = payload.intent.recipient;
  return (
    <Screen>
      <View style={styles.merchant}>
        <View style={styles.initial}><Text style={styles.initialText}>RC</Text></View>
        <View style={styles.merchantCopy}><Text style={styles.merchantName}>{payload.intent.merchantName}</Text><View style={styles.verified}><BadgeCheck color={colors.success} size={17} /><Text style={styles.verifiedText}>Verified merchant</Text></View></View>
      </View>
      <View style={styles.amountBlock}><Text style={styles.label}>YOU PAY</Text><Text style={styles.amount}>{payload.intent.amount} <Text style={styles.asset}>{payload.intent.asset.code}</Text></Text><Text style={styles.reference}>{payload.intent.reference}</Text></View>
      <View style={styles.details}>
        <Detail label="Network" value="Stellar Testnet" />
        <Detail label="Recipient" value={`${recipient.slice(0, 10)}...${recipient.slice(-8)}`} mono />
        <Detail label="Asset" value="Native XLM" />
        <Detail label="Expires" value="About 10 minutes" />
      </View>
      {mutation.error && <Text style={styles.error}>Payment could not be authorized. No funds were moved.</Text>}
      <Button loading={mutation.isPending} icon={<Fingerprint color={colors.black} size={21} />} onPress={() => mutation.mutate()}>
        {mutation.isPending ? 'Confirming securely' : 'Approve payment'}
      </Button>
    </Screen>
  );
}

function Detail({label, value, mono}: {label: string; value: string; mono?: boolean}) {
  return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={[styles.detailValue, mono && styles.mono]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  merchant: {alignItems: 'center', flexDirection: 'row', gap: spacing.md},
  initial: {alignItems: 'center', backgroundColor: colors.amberSoft, borderRadius: radius.md, height: 52, justifyContent: 'center', width: 52},
  initialText: {fontSize: 17, fontWeight: '700', color: colors.amberDark},
  merchantCopy: {gap: spacing.xs},
  merchantName: {...typography.title, color: colors.ink},
  verified: {alignItems: 'center', flexDirection: 'row', gap: spacing.xs},
  verifiedText: {...typography.label, color: colors.success},
  amountBlock: {alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, padding: spacing.xl, gap: spacing.sm},
  label: {...typography.label, color: colors.rose},
  amount: {fontSize: 38, lineHeight: 46, fontWeight: '700', color: colors.ink},
  asset: {fontSize: 18},
  reference: {...typography.body, color: colors.inkMuted},
  details: {borderBottomColor: colors.line, borderTopColor: colors.line, borderTopWidth: 1, borderBottomWidth: 1},
  detailRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 50, gap: spacing.md},
  detailLabel: {...typography.label, color: colors.inkMuted},
  detailValue: {...typography.label, color: colors.ink, flexShrink: 1, textAlign: 'right'},
  mono: {...typography.mono},
  error: {...typography.label, color: colors.danger},
});
