export type SignerIdentity = {
  signerId: string;
  publicKey: string;
  kind: 'passkey' | 'device-key' | 'mock';
};

export type PaymentAuthorizationRequest = {
  intentId: string;
  intentHash: string;
  network: 'testnet' | 'pubnet';
  settlementContractId: string;
};

export type PaymentAuthorization = {
  signerId: string;
  authorization: string;
  authorizedAt: string;
};

export interface SecureSigner {
  getIdentity(): Promise<SignerIdentity | null>;
  createIdentity(displayName: string): Promise<SignerIdentity>;
  authorizePayment(request: PaymentAuthorizationRequest): Promise<PaymentAuthorization>;
}

export type NativeSignerBridge = {
  getIdentity(): Promise<SignerIdentity | null>;
  createIdentity(displayName: string): Promise<SignerIdentity>;
  authorizePayment(request: PaymentAuthorizationRequest): Promise<PaymentAuthorization>;
};

export class NativeSecureSigner implements SecureSigner {
  constructor(private readonly bridge: NativeSignerBridge) {}
  getIdentity = () => this.bridge.getIdentity();
  createIdentity = (displayName: string) => this.bridge.createIdentity(displayName);
  authorizePayment = (request: PaymentAuthorizationRequest) => this.bridge.authorizePayment(request);
}
