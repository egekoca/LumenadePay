import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Fingerprint, ShieldCheck} from 'lucide-react-native';
import {StyleSheet, Text, View} from 'react-native';
import {Button, colors, radius, spacing, typography} from '@sorapay/ui';
import type {RootStackParams} from '../../app/navigation';
import {Screen} from '../../shared/Screen';

type Props = NativeStackScreenProps<RootStackParams, 'Welcome'>;

export function WelcomeScreen({navigation}: Props) {
  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.brandMark}><Text style={styles.brandLetter}>S</Text></View>
      <View style={styles.copy}>
        <Text style={styles.title}>Sora Pay</Text>
        <Text style={styles.subtitle}>Pay the right merchant, with the exact amount you approved.</Text>
      </View>
      <View style={styles.securityRow}>
        <ShieldCheck color={colors.success} size={22} />
        <Text style={styles.securityText}>Your wallet is protected by your device</Text>
      </View>
      <View style={styles.actions}>
        <Button icon={<Fingerprint color={colors.black} size={20} />} onPress={() => navigation.replace('Main')}>
          Create your wallet
        </Button>
        <Button tone="secondary" onPress={() => navigation.replace('Main')}>Sign in with passkey</Button>
        <Text style={styles.network}>STELLAR TESTNET</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {justifyContent: 'center'},
  brandMark: {alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.amber, borderRadius: radius.md, height: 56, justifyContent: 'center', width: 56},
  brandLetter: {fontSize: 30, fontWeight: '800', color: colors.black},
  copy: {gap: spacing.sm},
  title: {...typography.display, color: colors.ink},
  subtitle: {...typography.body, color: colors.inkMuted, maxWidth: 360},
  securityRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  securityText: {...typography.label, color: colors.success, flexShrink: 1},
  actions: {gap: spacing.md, marginTop: spacing.xl},
  network: {...typography.label, color: colors.amberDark, textAlign: 'center'},
});
