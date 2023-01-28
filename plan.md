

## Brief
If wallet 0xf346f1ab880d5b2cd0333bf69c280a732fa4a1c4 has 100M ETH Tokens this balance needs to be reflected in the new wallet address that this holder will have in the new parachain.

### Dev plan
1. Spin up Ganache locally to simulate an ethereum network
2. Spin up a relay chain with validator nodes to host parachain
3. Deploy the frontier-evm-node template as parachain hosted on the relay chain
    * The frontier node runtime will use the following palletes:
        * Balance (for fund transfer)
        * EVM pallete (to run EVM token contract)
        * OCW for off chain workers (to call ETH RPCs from Ganache)
        * Contracts pallete (to execute batch-wise fund transfers)
    * Off chain worker will send a subscribe request to ETH block events on ganache, registering a [custom rpc endpoint](https://substrate.stackexchange.com/questions/5554/how-to-add-custom-rpcs)
    * Ganache will send block balances with associated account IDs to bridge rpc endpoint
    * Runtime mirrors this information in storage
4. A smart contract is deployed that will transfer balances from the Ganache wallet to the parachain
    * Takes account ID source, target, and balance to transfer
5. An off chain worker listens for this transaction block, emits an RPC event back to Ganache to deplete the source wallet of the elected funds

### Developing the runtime
- Use [offchain workers](https://substrate.recipes/off-chain-workers/http-json.html) to make http requests from runtime
- Use runtime to send and listen to requests from Ganache JSON RPC
- Contract:
    * Listen to stream from ganache
    * Track ETH transactions
    * Lock ETH funds
    * Mint tokens using balances pallete



### Improvements
- No off-chain worker exists for websocket connections, this would need to be developed for production