import express from "express";
import bodyParser from "body-parser";
import { Keyring, WsProvider,  } from '@polkadot/api';
import * as dotenv from 'dotenv';
import { BridgeContract, TokenContract } from "./services/ethRelay";
import { ParachainBridge } from "./services/parachainRelay";
import { MemoryDatabase } from "./models/db";
import { Bridge } from "./services/bridge";
import { KeyringPair } from "@polkadot/keyring/types";

dotenv.config();

const tokenContract = new TokenContract(process.env.ETH_TOKEN_CONTRACT_ADDRESS!, process.env.ETH_OWNER_PRIVATE_KEY!, process.env.ETH_CONTRACT_OWNER!, process.env.ETH_HOST!)
const bridgeContract = new BridgeContract(process.env.ETH_BRIDGE_CONTRACT_ADDRESS!, process.env.ETH_OWNER_PRIVATE_KEY!, tokenContract, process.env.ETH_HOST!)

// Setup substrate
const wsProvider = new WsProvider(process.env.PARACHAIN_HOST!);
const parachainBridge = new ParachainBridge(process.env.PARACHAIN_KEY_URI!, wsProvider, process.env.PARACHAIN_ADDRESS!);

const database = new MemoryDatabase()

// Attach transferhook
bridgeContract.attachTransferHook((from: string, to: KeyringPair, value: number) => parachainBridge.mintSubstrate(from,to,value),(ethAddress: string) => database.getUser(ethAddress));

const bridgeRelay = new Bridge(tokenContract, bridgeContract, parachainBridge);

const app = express();
app.use(bodyParser.json());

const port = 8080; // default port to listen


// Server-side secure
app.post("/register", async (req, res) => {
    const data = req.body;
    const userRegisterResult = await database.registerUser(data.eth, data.uri);
    if (userRegisterResult.isOk) {
        res.sendStatus(201);
    } else {
        res.sendStatus(409); // Conflict, already exists
    }
    
})

// Server-side secure
app.post("/add-funds", async (req, res) => {
    const data = req.body;
    const transferResult = await tokenContract.transferJUR(data.eth, data.amount);
    if (transferResult.isOk) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
    
})

// ONLY EVER CALL THIS ON CLIENT-SIDE!
// Private key should be loaded from key store
app.post("/transfer", async (req, res) => {
    const data = req.body;
    const paraId = database.getUser(data.eth)
    if (paraId.isOk) {
        await bridgeRelay.transferFunds({
            userParaId: paraId.value,
            userPublic: data.eth,
            userPrivate: data.ethPriv,
            amount: data.amount
        })
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
    
})

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );