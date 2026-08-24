import {z} from 'zod';
import type {AnchorInfo} from './stellarToml';
import type {SessionToken} from './webAuth';

/**
 * SEP-24, the hosted deposit and withdrawal flow. The anchor returns a URL that
 * Rosa Pay opens; the anchor collects KYC, the amount and the payment details on
 * its own pages.
 *
 * That is the point of choosing SEP-24 over SEP-6: identity documents and bank
 * details are the anchor's regulated business, and Rosa Pay is better off never
 * holding them.
 */
export type InteractiveKind = 'deposit' | 'withdraw';

export type InteractiveSession = {
  /** Open this in a browser the customer can see is the anchor's. */
  url: string;
  transactionId: string;
};

export const anchorTransactionStatuses = [
  'incomplete',
  'pending_user_transfer_start',
  'pending_user_transfer_complete',
  'pending_external',
  'pending_anchor',
  'pending_stellar',
  'pending_trust',
  'pending_user',
  'completed',
  'refunded',
  'expired',
  'no_market',
  'too_small',
  'too_large',
  'error',
] as const;

export type AnchorTransactionStatus = (typeof anchorTransactionStatuses)[number];

export const anchorTransactionSchema = z.object({
  id: z.string().min(1),
  kind: z.string().min(1),
  status: z.string().min(1),
  amount_in: z.string().optional(),
  amount_out: z.string().optional(),
  amount_fee: z.string().optional(),
  stellar_transaction_id: z.string().optional(),
  external_transaction_id: z.string().optional(),
  more_info_url: z.string().optional(),
  message: z.string().optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  /** Present on a withdrawal: where the customer's asset must be sent. */
  withdraw_anchor_account: z.string().optional(),
  withdraw_memo: z.string().optional(),
  withdraw_memo_type: z.string().optional(),
});

export type AnchorTransaction = z.infer<typeof anchorTransactionSchema>;

export type InteractiveErrorCode = 'TRANSFER_UNSUPPORTED' | 'INTERACTIVE_REFUSED' | 'UNTRUSTED_URL' | 'UNKNOWN_TRANSACTION';

export class InteractiveError extends Error {
  override readonly name = 'InteractiveError';
  constructor(readonly code: InteractiveErrorCode, message: string) {
    super(message);
  }
}

/**
 * Whether a URL is safe to open for this anchor.
 *
 * The interactive URL is chosen by the anchor, and Rosa Pay opens it in a
 * browser holding a session the customer trusts. A URL pointing anywhere else is
 * a way to put a convincing page in front of someone mid-payment, so it is
 * refused rather than opened.
 */
export function isTrustedAnchorUrl(url: string, anchor: AnchorInfo): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:') return false;
  const host = parsed.hostname.toLowerCase();
  const domain = anchor.homeDomain.toLowerCase();
  // The anchor's own domain, or a subdomain of it.
  return host === domain || host.endsWith(`.${domain}`);
}

export type InteractiveInput = {
  anchor: AnchorInfo;
  session: SessionToken;
  kind: InteractiveKind;
  assetCode: string;
  assetIssuer?: string;
  /** Where a deposit should land, or which account funds a withdrawal. */
  account?: string;
  amount?: string;
  fetcher?: typeof fetch;
};

export async function startInteractive(input: InteractiveInput): Promise<InteractiveSession> {
  const {anchor, session, kind, fetcher = fetch} = input;
  if (!anchor.transferServerSep24) {
    throw new InteractiveError(
      'TRANSFER_UNSUPPORTED',
      `${anchor.homeDomain} does not offer hosted deposits or withdrawals`,
    );
  }

  const body: Record<string, string> = {asset_code: input.assetCode};
  if (input.assetIssuer) body.asset_issuer = input.assetIssuer;
  if (input.account ?? session.account) body.account = input.account ?? session.account;
  if (input.amount) body.amount = input.amount;

  let payload: {url?: string; id?: string; error?: string};
  try {
    const response = await fetcher(`${anchor.transferServerSep24}/transactions/${kind}/interactive`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify(body),
    });
    payload = (await response.json()) as typeof payload;
    if (!response.ok || !payload.url || !payload.id) {
      throw new InteractiveError(
        'INTERACTIVE_REFUSED',
        payload.error ?? `${anchor.homeDomain} would not start this ${kind}`,
      );
    }
  } catch (error) {
    if (error instanceof InteractiveError) throw error;
    throw new InteractiveError('INTERACTIVE_REFUSED', `${anchor.homeDomain} could not be reached`);
  }

  if (!isTrustedAnchorUrl(payload.url!, anchor)) {
    throw new InteractiveError(
      'UNTRUSTED_URL',
      'The anchor asked Rosa Pay to open a page on another domain, so it was not opened',
    );
  }

  return {url: payload.url!, transactionId: payload.id!};
}

export type TransactionQuery = {
  anchor: AnchorInfo;
  session: SessionToken;
  transactionId: string;
  fetcher?: typeof fetch;
};

/** Reads where a deposit or withdrawal has got to. */
export async function readTransaction(query: TransactionQuery): Promise<AnchorTransaction> {
  const {anchor, session, transactionId, fetcher = fetch} = query;
  if (!anchor.transferServerSep24) {
    throw new InteractiveError('TRANSFER_UNSUPPORTED', `${anchor.homeDomain} has no transfer server`);
  }

  const url = new URL(`${anchor.transferServerSep24}/transaction`);
  url.searchParams.set('id', transactionId);

  const response = await fetcher(url.toString(), {
    headers: {authorization: `Bearer ${session.token}`},
  });
  if (!response.ok) {
    throw new InteractiveError('UNKNOWN_TRANSACTION', `${anchor.homeDomain} does not know that transaction`);
  }
  const body = (await response.json()) as {transaction?: unknown};
  const parsed = anchorTransactionSchema.safeParse(body.transaction);
  if (!parsed.success) {
    throw new InteractiveError('UNKNOWN_TRANSACTION', `${anchor.homeDomain} returned a transaction Rosa Pay cannot read`);
  }
  return parsed.data;
}

/** Whether a status means the customer has to go back to the anchor's pages. */
export function needsCustomerAction(status: string): boolean {
  return status === 'incomplete' || status === 'pending_user' || status === 'pending_user_transfer_start';
}

/** Whether a status means nothing further will happen. */
export function isFinal(status: string): boolean {
  return ['completed', 'refunded', 'expired', 'error', 'no_market', 'too_small', 'too_large'].includes(status);
}
