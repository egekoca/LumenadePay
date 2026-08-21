import {describe, expect, it} from 'vitest';
import {createStellarConfig, isValidStellarAddress} from '../src';

describe('Stellar boundary', () => {
  it('uses explicit testnet configuration', () => {
    const config = createStellarConfig('testnet');
    expect(config.rpcUrl).toBe('https://soroban-testnet.stellar.org');
    expect(config.settlementContractId).toBeNull();
  });

  it('rejects pubnet without an RPC provider and invalid addresses', () => {
    expect(() => createStellarConfig('pubnet')).toThrow('provider-specific');
    expect(isValidStellarAddress('G-not-an-address')).toBe(false);
    expect(isValidStellarAddress('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF')).toBe(true);
  });
});
