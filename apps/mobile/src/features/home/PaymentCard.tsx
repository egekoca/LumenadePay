import {useEffect, useRef} from 'react';
import {Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {Copy} from 'lucide-react-native';
import Svg, {Defs, LinearGradient, Path, Rect, Stop} from 'react-native-svg';
import {CountUp, radius, spacing, typography} from '@rosapay/ui';
import {AssetMark} from './AssetMark';

/** One state at a time, so the card never says two things at once. */
export type PaymentCardState = 'no-wallet' | 'loading' | 'error' | 'ready';

export type PaymentCardHolding = {code: string; amount: string};

export type PaymentCardProps = {
  holdings: PaymentCardHolding[];
  /** What the balance is worth, when an anchor actually quoted a rate. */
  value?: {amount: string; currency: string};
  address?: string;
  state: PaymentCardState;
  onCopy(): void;
};

/*
 * Set in the small print of a card, so each has to survive being read at eight
 * point in capitals. A sentence does not; these are labels.
 */
const captions: Record<PaymentCardState, string> = {
  'no-wallet': 'NOT YET CREATED',
  loading: 'READING',
  error: 'RECONNECTING',
  ready: 'AVAILABLE',
};

/** A payment card is 85.6 by 53.98 millimetres, everywhere in the world. */
const CARD_RATIO = 53.98 / 85.6;

/**
 * The wallet as a card you are holding, rather than a panel in a dashboard.
 *
 * Three things do the work. It sits in space rather than flat against the
 * screen, because a card perfectly square to you is a picture of a card. Its
 * gold is marbled — turbulence pushing the gradient around — since real metal
 * is never one even wash, and an even wash is exactly what reads as generated.
 * And the type is set the way a card is printed: a few small monospaced marks
 * in the corners around one large number.
 *
 * The sweep is a single specular band crossing on a long, slow loop, the way
 * light travels over metal as you turn it. Not a pulse, and not a glow.
 */
export function PaymentCard({holdings, value, address, state, onCopy}: PaymentCardProps) {
  const {width} = useWindowDimensions();
  const sweep = useRef(new Animated.Value(0)).current;
  // Perspective widens the near edge, so the card is measured a little
  // narrower than its slot; without this the right edge runs off the screen.
  const cardWidth = Math.min(width - spacing.xl * 2 - 14, 500);
  const cardHeight = Math.round(cardWidth * CARD_RATIO);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        // A long rest, so the card is mostly still and the sweep is an event.
        Animated.delay(4200),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [sweep]);

  const primary = holdings[0];
  // Whatever else is in the wallet. Shown small, because a customer reads the
  // headline number first and only then asks what else is in there.
  const rest = holdings.slice(1);
  const shown = address
    ? `${address.slice(0, 4)} ${address.slice(4, 8)} •••• ${address.slice(-4)}`
    : '•••• •••• •••• ••••';

  const translateX = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-cardWidth * 0.9, cardWidth * 1.5],
  });

  return (
    <View style={styles.stage}>
      <View style={[styles.card, {height: cardHeight, width: cardWidth}]}>
        {/*
         * One canvas in card coordinates: 100 wide by 63 tall, the proportions
         * of the card itself. A nested Svg would open its own viewport and
         * paint over everything under it, which is how the veins first came
         * out as black gaps rather than as sheen.
         */}
        <Svg
          style={StyleSheet.absoluteFill}
          width="100%"
          height="100%"
          viewBox="0 0 100 63"
          preserveAspectRatio="none">
          <Defs>
            {/* Gold is never one colour: a warm shadow, a bright edge, a cooler
                fall-off. Flat yellow is what a single stop looks like. */}
            <LinearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#7A4F0B" />
              <Stop offset="0.22" stopColor="#C68C22" />
              <Stop offset="0.42" stopColor="#F3CB74" />
              <Stop offset="0.55" stopColor="#FFE7AE" />
              <Stop offset="0.7" stopColor="#D9A238" />
              <Stop offset="0.86" stopColor="#8A5E10" />
              <Stop offset="1" stopColor="#5E3B06" />
            </LinearGradient>
            {/*
             * The veins. Each is its own soft gradient rather than one colour,
             * so a band brightens along its length the way a rolled surface
             * does instead of sitting on the card like a decal.
             */}
            <LinearGradient id="veinLight" x1="0" y1="0" x2="1" y2="0.4">
              <Stop offset="0" stopColor="#FFF3D2" stopOpacity="0" />
              <Stop offset="0.45" stopColor="#FFF3D2" stopOpacity="0.9" />
              <Stop offset="1" stopColor="#FFF3D2" stopOpacity="0" />
            </LinearGradient>
            <LinearGradient id="veinDark" x1="0" y1="0" x2="1" y2="0.6">
              <Stop offset="0" stopColor="#5E3B06" stopOpacity="0" />
              <Stop offset="0.5" stopColor="#5E3B06" stopOpacity="0.8" />
              <Stop offset="1" stopColor="#5E3B06" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="63" fill="url(#gold)" />
          {/*
           * Marbling, drawn rather than filtered. react-native-svg ships
           * FeTurbulence and FeDisplacementMap but implements neither outside
           * the web, so the filter that would have made this silently did
           * nothing and warned on every render. These curves are the same
           * effect by hand: broad S-bends that never quite run parallel,
           * because parallel is what a machine would draw.
           */}
          <Path d="M-8 44 C 16 30, 30 46, 52 30 S 84 6, 112 14 L112 26 C 84 20, 70 40, 50 44 S 18 44, -8 56 Z" fill="url(#veinLight)" opacity={0.5} />
          <Path d="M-8 20 C 20 12, 34 26, 58 14 S 88 -2, 112 2 L112 9 C 88 6, 74 20, 54 24 S 20 22, -8 30 Z" fill="url(#veinDark)" opacity={0.34} />
          <Path d="M-8 58 C 18 50, 40 62, 62 48 S 92 30, 112 36 L112 44 C 92 40, 74 56, 52 60 S 16 66, -8 66 Z" fill="url(#veinDark)" opacity={0.26} />
          <Path d="M-8 36 C 14 34, 28 40, 46 34 S 80 22, 112 28 L112 31 C 80 26, 62 38, 44 40 S 12 40, -8 40 Z" fill="url(#veinLight)" opacity={0.36} />
        </Svg>

        <Animated.View
          pointerEvents="none"
          style={[styles.sweep, {height: cardHeight * 2.2, transform: [{translateX}, {rotate: '18deg'}]}]}>
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
                <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.42" />
                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#shine)" />
          </Svg>
        </Animated.View>

        <View style={styles.inner}>
          <View style={styles.top}>
            <Text style={styles.brand}>LUMENADE PAY</Text>
            <Text style={styles.network}>STELLAR{'\n'}TESTNET</Text>
          </View>

          <View style={styles.middle}>
            <View style={styles.amountRow}>
              <AssetMark code={primary?.code ?? 'XLM'} size={26} />
              <CountUp value={Number(primary?.amount ?? 0)} decimals={2} style={styles.amount} />
              <Text style={styles.asset}>{primary?.code ?? 'XLM'}</Text>
            </View>
            {rest.length > 0 ? (
              <View style={styles.rest}>
                {rest.map(holding => (
                  <View key={holding.code} style={styles.restItem}>
                    <AssetMark code={holding.code} size={14} />
                    <Text style={styles.restText}>
                      {Number(holding.amount).toFixed(2)} {holding.code}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.bottom}>
            <View style={styles.legend}>
              <Text style={styles.legendLabel}>BALANCE</Text>
              <Text style={styles.legendValue}>
                {value ? `≈ ${value.amount} ${value.currency}` : captions[state]}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Copy wallet address"
              accessibilityRole="button"
              disabled={!address}
              onPress={onCopy}
              style={styles.numberRow}
              testID="copy-wallet-address">
              <Text style={styles.number}>{shown}</Text>
              {address ? <Copy color={inkSoft} size={13} /> : null}
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

/* Dark ink on gold, the way a card is actually printed. */
const ink = '#1C1503';
const inkSoft = 'rgba(28,21,3,0.62)';

const styles = StyleSheet.create({
  /*
   * The tilt. A few degrees only: the card should read as an object resting on
   * a surface, not as a slide caught mid-transition.
   */
  stage: {
    alignItems: 'center',
    transform: [{perspective: 1600}, {rotateX: '3deg'}, {rotateY: '-4deg'}],
  },
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 22},
    shadowOpacity: 0.55,
    shadowRadius: 34,
    elevation: 14,
  },
  sweep: {position: 'absolute', top: '-60%', width: 90},
  inner: {flex: 1, justifyContent: 'space-between', padding: spacing.lg},
  top: {alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between'},
  /* Small, wide-tracked, monospaced: the marks a card carries, not headings. */
  brand: {...typography.mono, color: ink, fontSize: 9.5, letterSpacing: 2.4},
  network: {...typography.mono, color: inkSoft, fontSize: 8, letterSpacing: 1.8, lineHeight: 11, textAlign: 'right'},
  middle: {gap: spacing.xs},
  amountRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  amount: {color: ink, fontSize: 38, fontWeight: '700', letterSpacing: -1.4, lineHeight: 42},
  asset: {...typography.mono, color: inkSoft, fontSize: 12, letterSpacing: 1.4, marginTop: 10},
  rest: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md},
  restItem: {alignItems: 'center', flexDirection: 'row', gap: 5},
  restText: {...typography.mono, color: inkSoft, fontSize: 11, letterSpacing: 0.6},
  bottom: {alignItems: 'flex-end', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between'},
  legend: {gap: 2},
  legendLabel: {...typography.mono, color: inkSoft, fontSize: 7.5, letterSpacing: 1.8},
  legendValue: {...typography.mono, color: ink, fontSize: 9.5, letterSpacing: 1.2},
  numberRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.xs},
  number: {...typography.mono, color: ink, fontSize: 12, letterSpacing: 1.4},
});
