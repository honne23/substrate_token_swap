

## Brief
If wallet 0xf346f1ab880d5b2cd0333bf69c280a732fa4a1c4 has 100M ETH Tokens this balance needs to be reflected in the new wallet address that this holder will have in the new parachain.

### Dev plan
1. Spin up Ganache locally to simulate an ethereum network
2. Spin up a relay chain with validator nodes to host parachain
3. Deploy the frontier-evm-node template as parachain hosted on the relay chain
    * The frontier node runtime will use the following palletes:
        * Balance (for fund transfer)
        * EVM pallete
        * OCW for off chain workers
        * Contracts pallete
    * Frontier node will use off-chain workers to act as a light client for the Ganache network.
    * 

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