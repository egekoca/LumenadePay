# Fiat on and off ramp

Rosa Pay is not an anchor. It is a non-custodial client that talks to licensed
anchors over the SEP standards, so a customer can bring real money in and take it
back out without Rosa Pay ever touching their identity documents or their bank
details.

## What is implemented

`packages/anchor` is a provider-independent client for three standards:

- **SEP-1** — reads an anchor's `stellar.toml` to learn its endpoints, its
  signing key and the assets it handles. An anchor that publishes no signing key
  or no network is refused, because nothing it said afterwards could be checked.
- **SEP-10** — the handshake that proves a customer controls their account. The
  challenge is a real Stellar transaction handed over by a third party, so it is
  verified before the customer's key goes near it: signed by the key the anchor
  published, sequence zero so it can never reach the ledger, naming this
  customer, this anchor and this network.
- **SEP-24** — hosted deposit and withdrawal. The anchor returns a URL Rosa Pay
  opens and a transaction id to follow.

SEP-24 is chosen over SEP-6 deliberately. Identity documents and payment details
are the anchor's regulated business, and Rosa Pay is better off never holding
them.

## What the client refuses

- A challenge signed by anyone but the anchor, or naming another account, or for
  another network — and the device is never asked to sign it.
- An interactive URL on any domain but the anchor's own or a subdomain of it,
  over HTTPS. The customer is mid-payment and would believe the page they are
  shown, so a redirect elsewhere is not opened.

## The account question

Rosa Pay's customer wallet is a contract account. SEP-10 authenticates classic
accounts; contract accounts are SEP-45, which the SDF test anchor already
publishes as `WEB_AUTH_FOR_CONTRACTS_ENDPOINT`. Discovery reads that endpoint and
its contract id, so the seam exists, but the implemented handshake is SEP-10.

This matters for where deposited value lands: a SEP-10 session authenticates a
classic account, and USDC delivered there needs a trustline and then a move into
the smart wallet before it can be spent at a counter.

## Next

1. Prove the flow against `testanchor.stellar.org` end to end.
2. Add "Add money" and "Withdraw" to the wallet screen, opening the interactive
   URL in an in-app browser and following the transaction to completion.
3. MoneyGram Ramps sandbox, which needs allowlisting and a published domain.
