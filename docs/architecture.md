# Rosa Pay Architecture

## Status

This document describes the implemented foundation and the boundaries that must remain stable as Rosa Pay moves from a mocked QR payment to Testnet settlement. The product name is **Rosa Pay** and the application/package slug is **RosaPay**.

## Runtime shape

```text
React Native app (iOS + Android)
  -> application/domain packages
  -> protocol package (pure RTP/1 validation and canonical hashes)
  -> Stellar adapter (RPC, address and merchant signature verification)
  -> SecureSigner port (native Swift/Kotlin implementation pending)

Fastify API -> repository port -> PostgreSQL adapter (production) / in-memory adapter (local)
Worker -> Stellar RPC health/indexing boundary
Soroban settlement contract -> approved asset -> customer authorization -> merchant payment
```

The mobile app is a bare React Native 0.85 application with the New Architecture enabled. A bare app is deliberate: secure native signing, platform key storage and Android NFC need native modules that should not be hidden behind an Expo runtime constraint.

The repository uses npm workspaces. Dependencies point inward: screens depend on application ports and packages, while protocol and domain code do not import React Native, Fastify or Stellar transport code.

## Package responsibilities

- `packages/protocol`: RTP/1 schemas, canonical JSON, QR URI encoding, policy validation and deterministic payment-intent hashing.
- `packages/domain`: payment state machine. It accepts events and returns explicit next states; it has no network or UI side effects.
- `packages/stellar`: Stellar RPC configuration and read-only adapter, StrKey validation and merchant signature verification.
- `packages/secure-signer`: the only signing port exposed to TypeScript. The first implementation is an injected bridge; production adapters will be Swift/Kotlin backed.
- `packages/ui`: platform-neutral design tokens and small presentational components.
- `apps/mobile`: navigation, screen orchestration, query/cache state, capability switching and the mocked QR vertical slice.
- `apps/api`: Fastify transport, request validation, idempotency and repository ports.
- `apps/worker`: background RPC health boundary; durable indexing is intentionally a later phase.
- `contracts/settlement`: Soroban settlement policy and on-chain replay protection.

## Signing and passkeys

JavaScript never receives a private key. `SecureSigner` accepts an opaque authorization request and returns an opaque signature or a typed error. A production native adapter must keep the key in Secure Enclave/Keychain (iOS) or Android Keystore, require user presence for payment authorization, and expose only public-key metadata to JS.

Passkey/smart-account support remains an explicit adapter decision. Browser IndexedDB/WebAuthn code is not used in React Native. Before enabling it, the team must prove native passkey availability on both platforms, define account recovery, and make the signer implement the same port. The current app therefore has a clean seam without claiming that passkeys are already production-ready.

## RTP/1 to settlement boundary

RTP/1 signs a canonical JSON payment intent and is the QR transport artifact. Soroban verifies a different, typed XDR preimage containing the exact on-chain payment fields. The implementation keeps these artifacts separate on purpose:

1. QR scanning validates the RTP/1 payload and merchant signature.
2. The authorization layer derives a typed settlement envelope from that payload.
3. The merchant signs the contract digest and the customer authorizes the contract call.
4. The contract checks network, contract address, merchant registration, nonce, expiry, asset, amount and recipient before transferring funds.

The TypeScript settlement-envelope builder and generated contract bindings are the next integration step. A QR signature must never be treated as an on-chain contract signature without that explicit mapping.

## Network and assets

The first network is Stellar Testnet. The read path uses Stellar RPC; Horizon is not used as the application source of truth. XLM is the first supported asset. USDC is enabled only after its Testnet issuer/SAC address and decimal policy are configured from verified deployment data; no placeholder address is allowed.

The contract stores the Testnet network identifier and settlement contract address in the signed intent. A pubnet deployment must use a separate configuration and separate keys.

## Platform sequencing

QR is the required common payment path and is the current vertical slice. Android NFC is an optimization after real QR settlement. iOS uses the same QR path as a safe fallback because background NFC behavior and entitlement requirements differ by device and OS version. NFC must not introduce a second payment protocol.

## Version baseline

- Node.js `>=22.11.0`
- React Native `0.85.x`
- `@stellar/stellar-sdk` `16.2.0`
- Stellar protocol `27`
- Stellar CLI `27.1.0`
- `soroban-sdk` `27.0.6`
- Rust stable with `wasm32v1-none`

## Delivery gates

The repository currently has a mocked QR flow, live Testnet RPC health checks and a tested/buildable settlement contract. Testnet deployment is intentionally not performed by the repository because it requires a user-controlled deployer/admin identity and native asset configuration. The deploy script validates those inputs and must be run only with secrets supplied through the environment.
