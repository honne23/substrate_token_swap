# An ERC20 <-> Substrate token swap
For a given ETH wallet:
 >Transfer a given balance to a new wallet address that belongs to the same holder in a substrate-based parachain.

### Architecture
```

 ┌──────────────┐                                              ┌────────────────────┐
 │              │                                              │                    │
 │  ETH Wallet  │                                              │ Parachain Wallet   │
 │              │                                              │                    │
 └───────┬──────┘                                              └───────▲────────────┘
         │                                                             │
         │      Transfer                                               │   Mint Tokens
 ┌───────▼──────┐ Req    ┌───────────────────────────┐ Mint RPC┌───────┴────────────┐
 │              ├───────►│                           ├────────►│                    │
 │ JURBridge.sol│        │    Node.js Relay (Bridge) │         │  JURToken.rs       │
 │              │◄───────┤                           │◄────────┤                    │
 └──────────────┘        └───────────────────────────┘ ACK     └────────────────────┘
  Lock Token                    Register  Users

```


# Testing
---

### Dependencies
Please make sure you have the following installed:
- [ganache](https://trufflesuite.com/ganache/)
- [truffle](https://trufflesuite.com/docs/truffle/how-to/install/)
- [substrate-contracts-node](https://github.com/paritytech/substrate-contracts-node)
- Rust tooling
- npm

#### Start ganache
```bash
ganache -m "buffalo learn average iron fly rocket bargain diet fly arrest thank keen"
```

#### Compile and migrate solidity contracts
```bash
cd jur-token/
rm -rf build/
truffle compile
truffle migrate
```

#### Start the contracts node
```
substrate-contracts-node --dev
```

#### Build the smart contract
```bash
cd jurbridge
cargo +nightly contract build
```

#### Connect to the subtrate node and upload the contract
1. Go to the [polkadot dashboard](https://polkadotjs-apps.web.app/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/contracts)
2. Upload the contract found at `./jurbridge/target/ink/jurbridge.contract`.
3. Copy the contract public address to the `PARACHAIN_ADDRESS` variable in `./relay-server/-env`.

## Test an end to end transfer
#### Testing using mocha: 
```bash
cd relay-server
npm test
```
```bash
Debugger listening on ws://127.0.0.1:9229/6b458a7f-0c17-469a-85c0-28974e8017ed
For help, see: https://nodejs.org/en/docs/inspector


  User register test
    ✔ tests that a user can successfully register

  User already exists test
    ✔ tests registration should fail if user already exists

  ETH to Substrate test
2023-02-04 15:17:24.027	INFO	/src/services/ethRelay.ts:70	Getting gas price and nonce
2023-02-04 15:17:24.031	INFO	/src/services/ethRelay.ts:74	Sending signed transaction
2023-02-04 15:17:24.047	INFO	/src/services/ethRelay.ts:120	Setting approval on token contract
2023-02-04 15:17:24.057	INFO	/src/services/ethRelay.ts:137	Locking funds on bridge contract
2023-02-04 15:17:24.069	INFO	/src/services/parachainRelay.ts:71	Connecting to substrate endpoint
2023-02-04 15:17:24.111	INFO	/src/services/parachainRelay.ts:82	Querying substrate contract for refTime and proofSize
2023-02-04 15:17:24.125	INFO	/src/services/parachainRelay.ts:96	Executing transfer to substrate
    ✔ tests that funds have been successfully transferred from eth to substrate (307ms)


  3 passing (341ms)
```
**See `relay-server/tests/integration.ts` for example usage**

#### Testing using REST
You can query the relay server using rest endpoints as follows:
```bash
curl -XPOST http://localhost:8080/register -d '{"eth":"0x7FB215F9Eb718e0757182Ae9a3A596Bcf0b1c40d", "uri":"//Alice"}' -H "Content-Type: application/json"

curl -XPOST http://localhost:8080/add-funds -d '{"eth":"0x7FB215F9Eb718e0757182Ae9a3A596Bcf0b1c40d", "amount": 10000000}' -H "Content-Type: application/json"

curl -XPOST http://localhost:8080/transfer -d '{"eth":"0x7FB215F9Eb718e0757182Ae9a3A596Bcf0b1c40d", "ethPriv": "0x9fed92bcfe9c078c15d3548e5763c17dde60715ce5fdca5c70f2bfd14b08a4e4", "amount": 1000}' -H "Content-Type: application/json"
```


**Please see the [plan](plan.md) and [notes](notes.md) for more details.**