import {describe, expect, it} from 'vitest';
import {StellarTransactionError} from '@rosapay/stellar';
import {confirmSubmittedSettlements, type SettlementConfirmationState} from '../src/confirmationWorker';

const hash = 'a'.repeat(64);

function stateFor(items: Array<{intentId: string; transactionHash: string}>): SettlementConfirmationState & {
  confirmed: Array<unknown>;
  failed: Array<unknown>;
} {
  const confirmed: Array<unknown> = [];
  const failed: Array<unknown> = [];
  return {
    confirmed,
    failed,
    async listSubmittedSettlements() {
      return items;
    },
    async confirm(...args) {
      confirmed.push(args);
    },
    async fail(...args) {
      failed.push(args);
    },
  };
}

describe('submitted settlement confirmation worker', () => {
  it('confirms receipts and preserves the receipt hash and ledger', async () => {
    const state = stateFor([{intentId: 'intent-1', transactionHash: hash}]);
    const summary = await confirmSubmittedSettlements({
      state,
      rpc: {confirmTransaction: async () => ({txHash: hash.toUpperCase(), ledger: 42})},
    });

    expect(summary).toEqual({scanned: 1, confirmed: 1, failed: 0, pending: 0});
    expect(state.confirmed).toEqual([['intent-1', hash.toUpperCase(), 42]]);
  });

  it('keeps not-found receipts pending for a later polling pass', async () => {
    const state = stateFor([{intentId: 'intent-2', transactionHash: hash}]);
    const summary = await confirmSubmittedSettlements({
      state,
      rpc: {
        confirmTransaction: async () => {
          throw new StellarTransactionError('NOT_FOUND', 'not indexed yet');
        },
      },
    });

    expect(summary).toEqual({scanned: 1, confirmed: 0, failed: 0, pending: 1});
    expect(state.failed).toHaveLength(0);
  });

  it('marks failed and invalid receipts as terminal failures', async () => {
    const state = stateFor([
      {intentId: 'intent-3', transactionHash: hash},
      {intentId: 'intent-4', transactionHash: hash},
    ]);
    let call = 0;
    const summary = await confirmSubmittedSettlements({
      state,
      rpc: {
        confirmTransaction: async () => {
          call += 1;
          if (call === 1) throw new StellarTransactionError('FAILED', 'failed on chain');
          return {txHash: 'b'.repeat(64), ledger: 43};
        },
      },
    });

    expect(summary).toEqual({scanned: 2, confirmed: 0, failed: 2, pending: 0});
    expect(state.failed).toEqual([
      ['intent-3', 'STELLAR_FAILED'],
      ['intent-4', 'STELLAR_INVALID_SUCCESS_RESPONSE'],
    ]);
  });
});
