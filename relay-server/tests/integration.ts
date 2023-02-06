import { BridgeContract,  TokenContract, } from "../src/services/ethRelay";
import { IDatabase, MemoryDatabase } from "../src/models/db";
import { Bridge } from "../src/services/bridge";
import { WsProvider,  } from '@polkadot/api';
import { ParachainBridge } from "../src/services/parachainRelay";
import { expect } from 'chai';
import * as dotenv from 'dotenv';
import { Type } from "typescript";
import { Ok, Result } from "ts-results";

dotenv.config();

const testPublic = "0x7FB215F9Eb718e0757182Ae9a3A596Bcf0b1c40d";
const testPrivate = "0x9fed92bcfe9c078c15d3548e5763c17dde60715ce5fdca5c70f2bfd14b08a4e4";


const getProviders = (): [IDatabase, TokenContract, BridgeContract, ParachainBridge, Bridge] => {
    
    const tokenContract = new TokenContract(
        process.env.ETH_TOKEN_CONTRACT_ADDRESS!, 
        process.env.ETH_OWNER_PRIVATE_KEY!, 
        process.env.ETH_OWNER_PUBLIC_KEY!, 
        process.env.ETH_HOST!
        );

    const bridgeContract = new BridgeContract(
        process.env.ETH_BRIDGE_CONTRACT_ADDRESS!, 
        process.env.ETH_OWNER_PRIVATE_KEY!, 
        process.env.ETH_OWNER_PUBLIC_KEY!,  
        process.env.ETH_HOST!, 
        tokenContract
        );

    // Setup substrate
    const wsProvider = new WsProvider(process.env.PARACHAIN_HOST!);
    const parachainBridge = new ParachainBridge(process.env.PARACHAIN_KEY_URI!, wsProvider, process.env.PARACHAIN_ADDRESS!);

    const database = new MemoryDatabase()

    const bridgeRelay = new Bridge(tokenContract, bridgeContract, parachainBridge);
    return [database, tokenContract, bridgeContract, parachainBridge, bridgeRelay];
}

function expectOk<T,E>(result: Result<T,E>, message: string) {
    expect(result.ok, message).to.be.true;
}




describe("ETH to Substrate test", () => {
    it("tests that funds have been successfully transferred from eth to substrate", async () => {

        // Initialise environment
        const [db, tokenContract, bridgeContract, parachainBridge, bridgeRelay] = getProviders();

        (await db.registerUser(testPublic, "//Alice")).unwrap();
        const paraId = db.getUser(testPublic).unwrap();

        const bridgeBalance = (await bridgeContract.getBalance(testPublic)).unwrap()
        const parachainBalance = (await parachainBridge.getBalance(paraId, (await parachainBridge.ownerPair()))).unwrap()

        // Test amount to transfer
        const transferAmount = 100;

        // Transfer to Tokens to test address from original contract
        (await tokenContract.transferJUR(testPublic, transferAmount)).unwrap();

        // Get current balance of the test wallet
        const ethUserBalance = (await tokenContract.getBalance(testPublic)).unwrap();


        // Transfer funds from test address into bridge address
        (await bridgeRelay.transferFunds({
            userPublic: testPublic,
            userPrivate: testPrivate,
            userParaId: paraId,
            amount: transferAmount
        })).unwrap();


        // Mint equivalent funds on the parachain address
        (await parachainBridge.mintSubstrate(testPublic, paraId, transferAmount)).unwrap()
        

        // Get post transfer balances
        const postEthUserBalance = (await tokenContract.getBalance(testPublic)).unwrap();
        const postBridgeBalance = (await bridgeContract.getBalance(testPublic)).unwrap();
        const postParachainBalance = (await parachainBridge.getBalance(paraId, (await parachainBridge.ownerPair()))).unwrap();

        // Check balances on all chains and wallets match expectations
        expect(ethUserBalance - transferAmount).to.be.eq(postEthUserBalance);
        expect(bridgeBalance + transferAmount).to.be.eq(postBridgeBalance);
        expect(parachainBalance + transferAmount).to.be.eq(postParachainBalance);
        
    })
})