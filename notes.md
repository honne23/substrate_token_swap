# ETH (VeChainThor) -> DOT bridge
1. https://wiki.polkadot.network/docs/learn-bridges
2. https://medium.com/polkadot-network/polkadot-substrate-and-ethereum-f0bf1ccbfd13
3. https://github.com/paritytech/parity-bridges-common
4. https://wiki.polkadot.network/docs/learn-bridges
5. https://www.parity.io/blog/what-is-a-light-client/
6. https://blog.knoldus.com/pallets-in-substrate-and-using-them-in-runtime/
7. https://github.com/jurteam/mvp-smart-contract/blob/master/contracts/JURToken.sol
8. https://github.com/substrate-developer-hub/substrate-node-template
9. https://github.com/substrate-developer-hub/substrate-node-template/tree/main/pallets/template/src
10. https://www.youtube.com/watch?v=-6BBIr-DmI4&ab_channel=Polkadot


### Proof of authority
**Proof of authority** (**PoA**) is an [algorithm](https://en.wikipedia.org/wiki/Algorithm "Algorithm") used with [blockchains](https://en.wikipedia.org/wiki/Blockchain "Blockchain") that delivers comparatively fast transactions through a consensus mechanism based on identity as a stake. The most notable platforms using PoA are _**VeChain**_,Bitgert,Palm Network and Xodex.

In PoA-based networks, transactions and blocks are validated by approved accounts, known as validators. Validators run software allowing them to put transactions in blocks.

With PoA, individuals earn the right to become validators, so there is an incentive to retain the position that they have gained. By attaching a reputation to identity, validators are incentivized to uphold the transaction process, as they do not wish to have their identities attached to a negative reputation. This is considered more robust than PoS, **while a stake between two parties may be even, it does not take into account each party’s total holdings**. This means that incentives can be unbalanced. On the other hand, PoA only allows non-consecutive block approval from any one validator, meaning that the risk of serious damage is centralized to the authority node.


#### Polkadot -> Ethereum Bridge

>There are obstacles to this, primarily the prohibitive price of gas for non-native crypto on the Ethereum mainnet. Some early efforts are already underway on creating such a piece of infrastructure (like ChainX). However, to work properly and without an additional validator/staking economy, this will need additional support from Polkadot, specifically by having its validators be required to make finality proofs available in formats native to Ethereum.
>[2]



#### Substrate light client nodes
A light client or light node is a simplified version of a Substrate node that only provides the runtime and current state. Light nodes enable users to connect to a Substrate runtime directly using a browser, browser extension, mobile device, or desktop computer. **With a light client node, you can use RPC endpoints written in Rust, JavaScript, or other languages to connect to the WebAssembly execution environment to read block headers, submit transactions, and view the results of transactions.**

### Substrate network types
-   **Solo chains** that implement their own security protocol and don't connect or communicate with any other chains. Bitcoin and Ethereum are examples of non-Substrate based solo chains.
-   **Relay chains** that provide decentralized security and communication for other chains that connect to them. Kusama and Polkadot are examples of relay chains.
- **Parachains** that are built to connect to a relay chain and have the <ins>ability to communicate with other chains that use the same relay chain.</ins> Because parachains depend on the relay chain to finalize the blocks produced, parachains must implement the same consensus protocol as the relay chain they target.


#### Where transactions are defined
As discussed in [Runtime development](https://docs.substrate.io/fundamentals/runtime-development/), the Substrate runtime contains the business logic that defines transaction properties, including:

-   What constitutes a valid transaction.
-   Whether the transactions are sent as signed or unsigned.
-   How transactions change the state of the chain.

Typically, **you use pallets to compose the runtime functions and to implement the transactions that you want your chain to support.** After you compile the runtime, users interact with the blockchain to submit requests that are processed as transactions. For example, a user might submit a request to **transfer funds** from one account to another. The request becomes a **signed transaction** that contains the signature for that user account and if there are sufficient funds in the user's account to pay for the transaction, the transaction executes successfully, and the transfer is made.
