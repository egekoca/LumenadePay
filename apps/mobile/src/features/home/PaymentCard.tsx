import {Copy} from 'lucide-react-native';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, CountUp, radius, spacing, typography} from '@rosapay/ui';
import {LumenadeMark} from '../../shared/LumenadeMark';

/** One state at a time, so the card never says two things at once. */
export type PaymentCardState = 'no-wallet' | 'loading' | 'error' | 'ready';

export type PaymentCardProps = {
  balance?: string;
  address?: string;
  state: PaymentCardState;
  onCopy(): void;
};

const captions: Record<PaymentCardState, string> = {
  'no-wallet': 'Created the first time you pay',
  loading: 'Reading your balance',
  error: 'Reconnecting to Stellar',
  ready: 'Available to spend',
};

/**
 * The wallet as a card in a pocket rather than a dashboard panel.
 *
 * People already know what a payment card is and what it tells them: whose it
 * is, what is on it, and its number along the bottom. Borrowing that shape means
 * the balance needs no label to explain it, and the address stops reading as a
 * technical field and starts reading as the card's number.
 */
export function PaymentCard({balance, address, state, onCopy}: PaymentCardProps) {
  const shown = address ? `${address.slice(0, 4)} ${address.slice(4, 8)} •••• ${address.slice(-4)}` : '•••• •••• •••• ••••';

  return (
    <View style={styles.card}>
      <View style={styles.sheen} pointerEvents="none" />

      <View style={styles.top}>
        <View style={styles.brand}>
          <LumenadeMark size={26} showOrbit={false} />
          <Text style={styles.brandText}>LUMENADE</Text>
        </View>
        <Text style={styles.network}>STELLAR TESTNET</Text>
      </View>

      <View style={styles.amountRow}>
        <CountUp value={Number(balance ?? 0)} decimals={2} style={styles.amount} />
        <Text style={styles.asset}>XLM</Text>
      </View>
      <Text style={styles.caption}>{captions[state]}</Text>

      <Pressable
        accessibilityLabel="Copy wallet address"
        accessibilityRole="button"
        disabled={!address}
        onPress={onCopy}
        style={styles.numberRow}
        testID="copy-wallet-address">
        <Text style={styles.number}>{shown}</Text>
        {address ? <Copy color="rgba(245,239,229,0.55)" size={15} /> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#12110E',
    borderColor: 'rgba(245,239,229,0.1)',
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: spacing.xl,
    // A card in a pocket has weight; a panel does not.
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 18},
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 10,
  },
  /*
   * Light catching the top-left corner. A tight circle read as an arc drawn on
   * the card; this one is wide enough and faint enough that only its centre is
   * visible, which is what makes it read as light rather than as a shape.
   */
  sheen: {
    backgroundColor: colors.amber,
    borderRadius: radius.round,
    height: 620,
    left: -260,
    opacity: 0.05,
    position: 'absolute',
    top: -470,
    width: 700,
  },
  top: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  brand: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  brandText: {...typography.overline, color: colors.ink, fontSize: 11},
  network: {...typography.overline, color: 'rgba(245,239,229,0.45)', fontSize: 9},
  amountRow: {alignItems: 'flex-end', flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl},
  amount: {color: colors.ink, fontSize: 44, fontWeight: '700', letterSpacing: -1.6, lineHeight: 48},
  asset: {...typography.label, color: colors.amber, fontSize: 15, marginBottom: 6},
  caption: {color: 'rgba(245,239,229,0.5)', fontSize: 12.5, marginTop: spacing.xs},
  numberRow: {
    alignItems: 'center',
    borderTopColor: 'rgba(245,239,229,0.1)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
  number: {...typography.mono, color: 'rgba(245,239,229,0.72)', fontSize: 14, letterSpacing: 1.4},
});
