import {p256} from '@noble/curves/nist.js';
import {Buffer} from 'buffer';
import {derToCompactSignature, uncompressedPointFromSpki, SecureSignerError} from '@rosapay/secure-signer';
import {createNativeRosaPaySigner} from '../../native/nativeSigner';
import {logger} from '../../shared/logger';

export type HardwareSignerReport = {
  state: 'ready' | 'created' | 'unavailable';
  publicKey?: string;
  detail?: string;
};

const signer = createNativeRosaPaySigner();

/** Reports whether this device already holds a payment key. */
export async function inspectHardwareSigner(): Promise<HardwareSignerReport> {
  try {
    const identity = await signer.getIdentity();
    return identity
      ? {state: 'ready', publicKey: identity.publicKey}
      : {state: 'unavailable', detail: 'No payment key on this device yet'};
  } catch (error) {
    return {state: 'unavailable', detail: describe(error)};
  }
}

export async function createHardwareSigner(): Promise<HardwareSignerReport> {
  try {
    const identity = await signer.createIdentity('Rosa Pay');
    logger.info('hardware_signer_created', {kind: identity.kind});
    return {state: 'created', publicKey: identity.publicKey};
  } catch (error) {
    return {state: 'unavailable', detail: describe(error)};
  }
}

/**
 * Proves the platform key really signs: asks for a signature over a known digest
 * and verifies it against the exported public key, exactly as the wallet
 * contract would. A device that cannot pass this cannot authorize payments.
 */
export async function verifyHardwareSigner(): Promise<HardwareSignerReport> {
  const digest = Buffer.alloc(32, 0x2a);
  try {
    const identity = await signer.getIdentity();
    if (!identity?.publicKey) {
      return {state: 'unavailable', detail: 'No payment key on this device yet'};
    }

    const signed = await signer.signDigest({
      digest: digest.toString('base64'),
      reason: 'Confirm this device can authorize payments',
    });
    const compact = derToCompactSignature(Uint8Array.from(Buffer.from(signed.signature, 'base64')));
    const point = uncompressedPointFromSpki(Uint8Array.from(Buffer.from(identity.publicKey, 'base64')));
    const verified = p256.verify(compact, Uint8Array.from(digest), point, {prehash: false});

    return verified
      ? {state: 'ready', publicKey: identity.publicKey, detail: 'Signature verified against the device key'}
      : {state: 'unavailable', detail: 'The device produced a signature that does not verify'};
  } catch (error) {
    return {state: 'unavailable', detail: describe(error)};
  }
}

function describe(error: unknown): string {
  if (error instanceof SecureSignerError) {
    switch (error.code) {
      case 'USER_CANCELLED':
        return 'You cancelled the device prompt';
      case 'BIOMETRIC_FAILED':
        return 'The device could not confirm it was you';
      case 'LOCKED_OUT':
        return 'Too many attempts; unlock the device and try again';
      default:
        return error.message;
    }
  }
  return error instanceof Error ? error.message : 'The hardware signer is unavailable';
}
