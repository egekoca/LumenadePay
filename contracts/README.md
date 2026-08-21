# Sora Pay Settlement Contract

The contract accepts only registered merchants and allowlisted SEP-41 token contracts. A payment
binds the network ID, settlement contract, customer, merchant, recipient, token, integer amount,
nonce, intent ID, and ledger expiry. The customer authorizes the exact invocation and the merchant
signs the contract intent digest. Consumed intent IDs use persistent storage with proactive TTL
extension; expiry is checked explicitly and never relies on TTL.

Build with Rust 1.84+ and Stellar CLI 27:

```sh
stellar contract build --manifest-path contracts/Cargo.toml
cargo test --manifest-path contracts/Cargo.toml
```
