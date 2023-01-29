

## Brief
If wallet 0xf346f1ab880d5b2cd0333bf69c280a732fa4a1c4 has 100M JUR Tokens this balance needs to be reflected in the new wallet address that this holder will have in the new parachain.

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
1. Spin up Ganache locally to simulate an ethereum network
2. Spin up a relay chain with validator nodes to host parachain
3. Deploy the frontier-evm-node template as parachain hosted on the relay chain
    * The frontier node runtime will use the following palletes:
        * Balance (for fund transfer)
        * EVM pallete (to run EVM token contract)
        * ~~OCW for off chain workers (to call ETH RPCs from Ganache)~~
        * Contracts pallete (to **execute batch-wise fund transfers**)
    * A smart contract (the `Substrate Contract`) will be deployed to the frontier node to handle incoming funds
    * The `Substrate Contract` will be called by an offchain relay (node web server) to mint tokens that have been marked for transfer.
4. The `JURBridge Contract` accepts `JUR` and locks it in the contract. It emits an Event indicating that a transfer to the parachain has initiated.
    * Takes account ID source, target, and balance to transfer
5. An off-chain `Relay` listens for this event on the Gananche network using the websocket RPCs, and mints tokens on the parachain side by submitting RPCs to the `Substrate Contract`.

### Parachain smart contract
- Records a mapping of ETH account IDs to Parachain account IDs
- Incoming RPCs from an ETH address will generate tokens for the associated parachain account ID

### ETH Contract
- ETH "bridge" contract will have a `transfer` function that sends ETH tokens to the parachain.
    - The smart contract will lock the funds (mapped to the owner's account id)
    - A relay listens for the transaction via rpc and initiates the substrate smart contract to generate the parachain funds

### Relay (web server)
- Uses JSON-RPCs to connect to both smart contracts and coordinate fund transfers 
