## An ERC20 <-> Substrate token swap
For a given ETH wallet:
 >Transfer a given balance to a new wallet address that belongs to the same holder in a substrate-based parachain.

### Dev plan
```
       ┌─────────────────┐
       │                 │
       │                 │
       │     Ganache     │
       │                 │
       │                 │
       └────────┬────────┘
                │
                │                                                               ┌────────────────────┐
          ┌─────▼────────┐                                                      │                    │
          │              │                                                      │      Frontier      │
          │   JURToken   │                                                      │       Runtime      │ Submit to parchain / relay
   Mint   │     .sol     │                                                      │                    │
   Tokens │              │                                                      │                    │
          │              │                                                      └─────────▲──────────┘
          └─────┬────────┘                                                                │
                │                                                                         │ Contract API
                │                                                                         │
           ┌────▼─────────┐               ┌────────────────────────┐               ┌──────┴──────┐
           │              │               │                        │               │             │
 Lock Funds│              │               │                        │               │  Substrate  │
           │  JURBridge   │◄──────────────┤    Relay Web Server    ├───────────────►  Contract   │ Mint Tokens
           │     .sol     │    JSON-RPC   │       (Node.js)        │   JSON-RPC    │             │
           │              │     (Signed)  │                        │    (Signed)   │             │
           └──────────────┘               └────────────────────────┘               └─────────────┘

```
**Please see the [plan](plan.md) and [notes](notes.md) for more details.**