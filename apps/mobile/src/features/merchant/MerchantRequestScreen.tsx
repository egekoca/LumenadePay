import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import {StyleSheet, Text, View} from 'react-native';
import {Button, colors, radius, spacing, typography} from '@sorapay/ui';
import {encodePaymentQr} from '@sorapay/protocol';
import type {RootStackParams} from '../../app/navigation';
import {Screen} from '../../shared/Screen';
import {mockSignedIntent} from '../payments/mockIntent';

type Props = NativeStackScreenProps<RootStackParams, 'MerchantRequest'>;

export function MerchantRequestScreen({navigation}: Props) {
  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.heading}><Text style={styles.title}>24.5 XLM</Text><Text style={styles.subtitle}>Rose Coffee - Table 08</Text></View>
      <View style={styles.qr}><QRCode value={encodePaymentQr(mockSignedIntent)} size={224} color={colors.black} backgroundColor="#FFFFFF" /></View>
      <View style={styles.expiry}><View style={styles.dot} /><Text style={styles.expiryText}>Request active - expires in 10 min</Text></View>
      <Button onPress={() => navigation.navigate('Confirm', {payload: mockSignedIntent})}>Preview customer payment</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {alignItems: 'stretch', justifyContent: 'center'},
  heading: {alignItems: 'center', gap: spacing.xs},
  title: {fontSize: 34, lineHeight: 42, fontWeight: '700', color: colors.ink},
  subtitle: {...typography.body, color: colors.inkMuted},
  qr: {alignItems: 'center', alignSelf: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, padding: spacing.xl},
  expiry: {alignItems: 'center', alignSelf: 'center', flexDirection: 'row', gap: spacing.sm},
  dot: {backgroundColor: colors.success, borderRadius: radius.round, height: 8, width: 8},
  expiryText: {...typography.label, color: colors.inkMuted},
});
