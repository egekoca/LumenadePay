#!/usr/bin/env bash
set -euo pipefail

: "${SORAPAY_DEPLOYER:?Set SORAPAY_DEPLOYER to a configured Stellar CLI identity}"
: "${SORAPAY_ADMIN:?Set SORAPAY_ADMIN to the admin G- or C-address}"
: "${SORAPAY_XLM_SAC:?Set SORAPAY_XLM_SAC to the verified Testnet native SAC address}"

stellar contract build --manifest-path contracts/Cargo.toml
stellar contract deploy \
  --wasm contracts/target/wasm32v1-none/release/sorapay_settlement.wasm \
  --source-account "$SORAPAY_DEPLOYER" \
  --network testnet \
  -- \
  --admin "$SORAPAY_ADMIN" \
  --initial_asset "$SORAPAY_XLM_SAC"
