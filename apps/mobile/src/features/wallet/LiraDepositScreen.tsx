import {useCallback, useEffect, useRef, useState} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Banknote, Building2, Copy, ShieldCheck} from 'lucide-react-native';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {AnimatedContent, Button, colors, radius, spacing, SurfaceCard, TextField, typography} from '@rosapay/ui';
import type {RootStackParams} from '../../app/navigation';
import {Screen} from '../../shared/Screen';
import {displayAmount} from '../../shared/displayAmount';
import {shareValue} from '../../shared/shareAddress';
import {useCurrentAccount} from './currentAccount';
import {
  LIRA_ANCHOR_HOME_DOMAIN,
  LiraRampError,
  quoteLiraDeposit,
  readLiraDeposit,
  simulateBankTransfer,
  startLiraDeposit,
  type LiraQuote,
  type StartedLiraDeposit,
} from './liraRamp';

type Props = NativeStackScreenProps<RootStackParams, 'LiraDeposit'>;

/** How often the anchor is asked whether the money has landed. */
const POLL_MS = 3_000;

/**
 * Turning lira into money that can be spent in this app.
 *
 * The order on screen is the order it happens in real life: say how much, read
 * back what you get, send the transfer at your bank, then watch it arrive. The
 * rate shown is `total_price`, the one including the anchor's spread, because
 * quoting the pre-fee rate would promise a number the customer never receives.
 *
 * Only a recovery-phrase account can be here. The anchor authenticates with
 * SEP-10 and publishes no SEP-45, so a contract account cannot prove itself to
 * it at all — the screen says so rather than failing at the last step.
 */
export function LiraDepositScreen({navigation}: Props) {
  const account = useCurrentAccount();
  const [amount, setAmount] = useState('500');
  const [quote, setQuote] = useState<LiraQuote>();
  const [started, setStarted] = useState<StartedLiraDeposit>();
  const [status, setStatus] = useState<string>();
  const [received, setReceived] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const polling = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const supported = account?.kind === 'classic';

  useEffect(() => () => clearInterval(polling.current), []);

  useEffect(() => {
    if (!amount.trim() || !supported) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const next = await quoteLiraDeposit(amount.trim());
        if (!cancelled) setQuote(next);
      } catch {
        // A rate that will not load is not an error worth a red banner while
        // someone is still typing; the button reports it if they go on.
        if (!cancelled) setQuote(undefined);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [amount, supported]);

  const poll = useCallback((deposit: StartedLiraDeposit) => {
    clearInterval(polling.current);
    polling.current = setInterval(async () => {
      try {
        const next = await readLiraDeposit(deposit);
        setStatus(next.status);
        if (next.settled || next.failed) {
          clearInterval(polling.current);
          if (next.amountOut) setReceived(next.amountOut);
        }
      } catch {
        // Left running: a dropped poll is not a failed deposit, and the anchor
        // is the one holding the answer.
      }
    }, POLL_MS);
  }, []);

  const open = async () => {
    if (!account) return;
    setBusy(true);
    setError(undefined);
    try {
      const deposit = await startLiraDeposit({
        address: account.address,
        amountTry: amount.trim(),
        reason: `Add ${amount.trim()} TRY to Lumenade Pay`,
      });
      setStarted(deposit);
      setStatus('pending_user_transfer_start');
      poll(deposit);
    } catch (failure) {
      setError(
        failure instanceof LiraRampError
          ? failure.message
          : failure instanceof Error
            ? failure.message
            : 'The deposit could not be opened',
      );
    } finally {
      setBusy(false);
    }
  };

  const simulate = async () => {
    if (!started) return;
    setBusy(true);
    setError(undefined);
    try {
      await simulateBankTransfer(started);
      setStatus('pending_anchor');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The sandbox bank did not answer');
    } finally {
      setBusy(false);
    }
  };

  if (!supported) {
    return (
      <Screen>
        <AnimatedContent>
          <View style={styles.hero}>
            <View style={styles.icon}><Banknote color={colors.amber} size={22} /></View>
            <Text style={styles.title}>Lira needs a recovery-phrase wallet</Text>
            <Text style={styles.subtitle}>
              The anchor verifies a wallet by having it sign a challenge, which only an ordinary Stellar account can
              do. This phone's wallet lives in its secure hardware and has no key that can answer. Set this phone up
              again with a recovery phrase to add money in lira.
            </Text>
          </View>
        </AnimatedContent>
        <AnimatedContent delay={90}>
          <Button onPress={() => navigation.goBack()}>Go back</Button>
        </AnimatedContent>
      </Screen>
    );
  }

  return (
    <Screen>
      <AnimatedContent>
        <View style={styles.hero}>
          <View style={styles.icon}><Banknote color={colors.amber} size={22} /></View>
          <Text style={styles.eyebrow}>ADD MONEY</Text>
          <Text style={styles.title}>Pay in lira</Text>
          <Text style={styles.subtitle}>
            Send a bank transfer in Turkish lira and receive USDC in this wallet. Rate and fee come from{' '}
            {LIRA_ANCHOR_HOME_DOMAIN}.
          </Text>
        </View>
      </AnimatedContent>

      {!started ? (
        <>
          <AnimatedContent delay={80} scaleFrom={0.985}>
            <SurfaceCard accent="amber" style={styles.form}>
              <TextField
                keyboardType="decimal-pad"
                label="AMOUNT (TRY)"
                maxLength={12}
                onChangeText={setAmount}
                placeholder="500"
                testID="lira-amount"
                value={amount}
              />
              {quote ? (
                <Text style={styles.rate} testID="lira-quote">
                  You receive {displayAmount(quote.buyAmount)} USDC · {displayAmount(quote.perUsdc)} TRY per USDC
                  {quote.feeTotal ? ` · fee ${displayAmount(quote.feeTotal)} TRY` : ''}
                </Text>
              ) : (
                <Text style={styles.rate}>Reading the anchor's rate…</Text>
              )}
            </SurfaceCard>
          </AnimatedContent>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AnimatedContent delay={160}>
            <Button loading={busy} onPress={() => void open()} testID="open-lira-deposit">
              Continue
            </Button>
          </AnimatedContent>
        </>
      ) : (
        <>
          <AnimatedContent delay={80} scaleFrom={0.985}>
            <SurfaceCard accent="amber" style={styles.form}>
              <View style={styles.instructionRow}>
                <Building2 color={colors.goldBright} size={18} />
                <View style={styles.instructionCopy}>
                  <Text style={styles.instructionLabel}>SEND TO</Text>
                  <Text style={styles.instructionValue}>{started.instructions.bankName ?? 'The anchor’s bank'}</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void shareValue('Anchor IBAN', started.instructions.iban ?? '')}
                    style={styles.copyRow}>
                    <Text style={styles.mono}>{started.instructions.iban}</Text>
                    <Copy color={colors.inkMuted} size={14} />
                  </Pressable>
                </View>
              </View>
              <View style={styles.separator} />
              <View style={styles.instructionRow}>
                <ShieldCheck color={colors.success} size={18} />
                <View style={styles.instructionCopy}>
                  <Text style={styles.instructionLabel}>REFERENCE (AÇIKLAMA)</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void shareValue('Transfer reference', started.instructions.reference ?? '')}
                    style={styles.copyRow}>
                    <Text style={styles.mono}>{started.instructions.reference}</Text>
                    <Copy color={colors.inkMuted} size={14} />
                  </Pressable>
                  <Text style={styles.body}>
                    Write this in the transfer description. It is what routes the money to your wallet.
                  </Text>
                </View>
              </View>
            </SurfaceCard>
          </AnimatedContent>

          <AnimatedContent delay={150}>
            <View style={styles.status}>
              <Text style={styles.instructionLabel}>STATUS</Text>
              <Text style={styles.statusValue} testID="lira-status">
                {readableStatus(status)}
              </Text>
              {received ? (
                <Text style={styles.received} testID="lira-received">
                  {displayAmount(received)} USDC arrived in this wallet.
                </Text>
              ) : null}
            </View>
          </AnimatedContent>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {status === 'pending_user_transfer_start' ? (
            <AnimatedContent delay={210}>
              {/*
                A sandbox affordance, named for what it is. There is no real bank
                behind this anchor, so nothing else would ever move the money.
              */}
              <Button loading={busy} onPress={() => void simulate()} testID="simulate-bank-transfer">
                Simulate the bank transfer
              </Button>
            </AnimatedContent>
          ) : null}
        </>
      )}
    </Screen>
  );
}

/** The anchor's own state names, said the way a person would say them. */
function readableStatus(status: string | undefined): string {
  switch (status) {
    case 'pending_user_transfer_start':
      return 'Waiting for your bank transfer';
    case 'pending_anchor':
      return 'The anchor has your lira and is converting it';
    case 'pending_stellar':
      return 'Sending the USDC to your wallet';
    case 'completed':
      return 'Done';
    case 'error':
      return 'The anchor could not finish this deposit';
    default:
      return status ?? 'Starting';
  }
}

const styles = StyleSheet.create({
  hero: {gap: spacing.xs},
  icon: {alignItems: 'center', backgroundColor: colors.goldSoft, borderColor: colors.goldDeep, borderRadius: radius.round, borderWidth: 1, height: 44, justifyContent: 'center', marginBottom: spacing.sm, width: 44},
  eyebrow: {...typography.label, color: colors.goldBright},
  title: {...typography.display, color: colors.ink, fontSize: 28, lineHeight: 34},
  subtitle: {...typography.body, color: colors.inkMuted},
  form: {gap: spacing.lg},
  rate: {...typography.body, color: colors.inkMuted},
  instructionRow: {flexDirection: 'row', gap: spacing.md},
  instructionCopy: {flex: 1, gap: spacing.xs},
  instructionLabel: {...typography.label, color: colors.inkMuted},
  instructionValue: {...typography.body, color: colors.ink},
  copyRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.xs},
  mono: {...typography.mono, color: colors.ink, fontSize: 13},
  body: {...typography.body, color: colors.inkFaint, fontSize: 13},
  separator: {backgroundColor: colors.lineSoft, height: 1},
  status: {gap: spacing.xs},
  statusValue: {...typography.body, color: colors.ink},
  received: {...typography.body, color: colors.success},
  error: {...typography.body, color: colors.danger},
});
