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



**Please see the [plan](plan.md) and [notes](notes.md) for more details.**