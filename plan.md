

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
    * The frontier-node will be directly connected to the Ganache network in order to listen to block headers
4. A smart contract is deployed that will transfer balances from the Ganache wallet to the parachain
    * Takes account ID source, target, and balance to transfer
5. An off chain worker listens for this transaction block, emits an RPC event back to Ganache to deplete the source wallet of the elected funds

### Parachain smart contract
- Records a mapping of ETH account IDs to Parachain account IDs
- Incoming RPCs from an ETH address will generate tokens for the associated parachain account ID

### ETH Contract
- ETH "bridge" contract will have a `transfer` function that sends ETH tokens to the parachain.
    - The smart contract will lock the funds (mapped to the owner's account id)
    - A relay listens for the transaction via rpc and initiates the substrate smart contract to generate the parachain funds

### Relay (web server)
- Uses JSON-RPCs to connect to both smart contracts and coordinate fund transfers 



### Using the off-chain worker with smart contracts:

- Use a smart contract to sign the requests that are sent to the off-chain worker. 
- The off-chain worker can then validate the signature and only process requests that are signed by the smart contract. 
- This way, the off-chain worker can be sure that the request is coming from the substrate chain and not from an arbitrary party.

