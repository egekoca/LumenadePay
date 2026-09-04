import {discoverAnchor, type QuoteSource} from '@rosapay/anchor';
import {useAppStore} from '../state/appStore';

/**
 * Where the app asks what money is worth.
 *
 * It used to be `testanchor.stellar.org`, on the principle that a rate should
 * come from a real Stellar service rather than a number this app invented. The
 * principle survives; the anchor did not. Nothing on Stellar prices Turkish
 * lira — of every domain in the Stellar Anchor Directory, two publish a quote
 * server and both price only the Brazilian real — and the test anchor's own
 * `/prices` has been answering 502. A merchant pricing a coffee in lira cannot
 * wait for that.
 *
 * So the rate comes from this deployment's own SEP-38 server, which is the same
 * protocol read the same way. What changes is provenance, not shape: these are
 * our rates from a public market feed, and `RATE_SOURCE_LABEL` is what the
 * screens say so nobody mistakes them for an anchor's.
 *
 * When a lira anchor exists, set `PRICE_ANCHOR_DOMAIN` and everything below
 * keeps working — that is the whole reason for wearing SEP-38's shape.
 */
const PRICE_ANCHOR_DOMAIN: string | undefined = undefined;

/** Named on any screen that shows a converted amount. */
export const RATE_SOURCE_LABEL = PRICE_ANCHOR_DOMAIN ?? 'market rate';

/** The currency amounts are read in, most preferred first. */
export const PREFERRED_CURRENCIES = ['TRY', 'USD', 'USDC'];

/**
 * Resolves the quote server once per call site.
 *
 * A discovered anchor and this deployment's own server are the same thing to
 * every caller — a `quoteServer` — which is what keeps the switch between them
 * a configuration change rather than a rewrite.
 */
export async function resolveQuoteSource(): Promise<QuoteSource> {
  if (PRICE_ANCHOR_DOMAIN) return discoverAnchor(PRICE_ANCHOR_DOMAIN);
  return {quoteServer: `${useAppStore.getState().apiBaseUrl}/sep38`};
}
