

## Brief
If wallet 0xf346f1ab880d5b2cd0333bf69c280a732fa4a1c4 has 100M ETH Tokens this balance needs to be reflected in the new wallet address that this holder will have in the new parachain.

### Dev plan
1. Spin up Ganache localcally to test wallets & contracts
2. Spin up frontier node with credentials from Ganache
3. Test smart contract transfer from Ganache to parachain

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