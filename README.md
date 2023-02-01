## An ERC20 <-> Substrate token swap
For a given ETH wallet:
 >Transfer a given balance to a new wallet address that belongs to the same holder in a substrate-based parachain.

### Dev plan
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
**Please see the [plan](plan.md) and [notes](notes.md) for more details.**