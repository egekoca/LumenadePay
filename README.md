# Sora Pay

Sora Pay is a non-custodial Stellar payment app for iOS and Android, built with React Native and TypeScript.

The product source of truth is [docs/PRD.md](docs/PRD.md). The implemented boundaries are documented in [architecture.md](docs/architecture.md), [rtp-1.md](docs/rtp-1.md), and [security-model.md](docs/security-model.md).

## Current Status

The foundation and first vertical slice are implemented:

- Bare React Native 0.85 app for iOS and Android, with one account and Customer/Merchant capability switching.
- English dark near-black, amber and restrained rose design system with a complete mocked QR request, scan, confirm and receipt flow.
- RTP/1 schema, QR codec, canonical hashing, merchant signature verification and policy tests.
- Stellar RPC adapter with live Testnet health checking.
- Fastify API boundary, idempotent intent service, database schema and worker foundation.
- Soroban settlement contract with customer auth, merchant signatures, asset policy, expiry and replay protection.

The Soroban contract builds to a 7,320-byte optimized WASM (`SHA-256 22b1d0638f6128407579e3993386fde7b0a2ed13494cccb49a3c080ddfe0ac7e`). It has not been deployed: Testnet deployment requires a user-controlled deployer/admin identity and verified native SAC configuration.

## Product Terms

- Product display name: `Sora Pay`
- Application/package slug: `SoraPay`
- Customer and merchant capabilities live in one mobile application.
- Stellar Testnet is the first target network.

## Repository

```text
apps/
  mobile/          React Native application
  api/             Fastify API and database boundary
  worker/          Stellar background worker boundary
packages/
  domain/          Payment state machine
  protocol/        RTP/1 types, validation, canonicalization and QR codec
  secure-signer/   Native signer interface
  stellar/         RPC and signature adapter
  ui/              Shared design tokens and components
contracts/
  settlement/      Soroban settlement contract
scripts/
  deploy-testnet.sh
```

## Prerequisites

- Node.js `>=22.11` and npm `>=11`
- Xcode and CocoaPods for iOS
- JDK 17, Android SDK 36 and the matching NDK for Android
- Rust stable with the `wasm32v1-none` target
- Stellar CLI `27.x`

## Install and Run

```bash
npm ci
cd apps/mobile/ios
pod install
cd ../../..
```

Start Metro at `http://localhost:8081`:

```bash
npm start
```

Run a native app in another terminal:

```bash
npm run ios
```

For Android on macOS, expose the local SDK first:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
npm run android
```

Start the API at `http://localhost:4100`:

```bash
npm run api
```

## Verify

```bash
npm run check
npm run lint
npm run contract:test
npm run contract:build
npm audit
```

## Testnet Deployment

Configure a Stellar CLI Testnet identity and pass only public addresses through the deployment environment:

```bash
SORAPAY_DEPLOYER=<cli-identity> \
SORAPAY_ADMIN=<G-or-C-address> \
SORAPAY_XLM_SAC=<verified-native-SAC-address> \
./scripts/deploy-testnet.sh
```

The next integration milestone is the typed TypeScript settlement envelope and generated contract binding, followed by a user-authorized Testnet deployment and replacement of the mocked settlement adapter. Native signer/passkey work follows that boundary; Android NFC remains the final fast path and QR remains mandatory on both platforms.
