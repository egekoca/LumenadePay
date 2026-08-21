import {describe, expect, it} from 'vitest';
import {NativeSecureSigner, type NativeSignerBridge} from '../src';

describe('native secure signer boundary', () => {
  it('returns only opaque authorization material to JavaScript', async () => {
    const bridge: NativeSignerBridge = {
      async getIdentity() {
        return {signerId: 'native-1', publicKey: 'public-only', kind: 'device-key'};
      },
      async createIdentity() {
        return {signerId: 'native-1', publicKey: 'public-only', kind: 'device-key'};
      },
      async authorizePayment(request) {
        return {signerId: 'native-1', authorization: `opaque:${request.intentHash}`, authorizedAt: '2026-08-21T00:00:00.000Z'};
      },
    };
    const signer = new NativeSecureSigner(bridge);
    const authorization = await signer.authorizePayment({
      intentId: 'intent-1',
      intentHash: 'a'.repeat(64),
      network: 'testnet',
      settlementContractId: 'CSETTLEMENT',
    });
    expect(authorization.authorization).toBe(`opaque:${'a'.repeat(64)}`);
    expect(authorization).not.toHaveProperty('privateKey');
  });
});
