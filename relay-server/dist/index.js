"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const api_1 = require("@polkadot/api");
const dotenv = __importStar(require("dotenv"));
const ethRelay_1 = require("./services/ethRelay");
const parachainRelay_1 = require("./services/parachainRelay");
const db_1 = require("./models/db");
const bridge_1 = require("./services/bridge");
dotenv.config();
const tokenContract = new ethRelay_1.TokenContract(process.env.ETH_TOKEN_CONTRACT_ADDRESS, process.env.ETH_OWNER_PRIVATE_KEY, process.env.ETH_CONTRACT_OWNER, process.env.ETH_HOST);
const bridgeContract = new ethRelay_1.BridgeContract(process.env.ETH_BRIDGE_CONTRACT_ADDRESS, process.env.ETH_OWNER_PRIVATE_KEY, tokenContract, process.env.ETH_HOST);
// Setup substrate
const wsProvider = new api_1.WsProvider(process.env.PARACHAIN_HOST);
const parachainBridge = new parachainRelay_1.ParachainBridge(process.env.PARACHAIN_KEY_URI, wsProvider, process.env.PARACHAIN_ADDRESS);
const database = new db_1.Database();
// Attach transferhook
bridgeContract.attachTransferHook((from, to, value) => parachainBridge.mintSubstrate(from, to, value), (ethAddress) => database.getUser(ethAddress));
const bridgeRelay = new bridge_1.Bridge(tokenContract, bridgeContract, parachainBridge);
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
const port = 8080; // default port to listen
// define a route handler for the default home page
app.get("/", (req, res) => {
    res.send("Hello world!");
});
// Server-side secure
app.post("/register", async (req, res) => {
    const data = req.body;
    await database.registerUser(data.eth, data.uri);
    res.sendStatus(201);
});
// Server-side secure
app.post("/add-funds", async (req, res) => {
    const data = req.body;
    await tokenContract.transferJUR(data.eth, data.amount);
    res.sendStatus(200);
});
// ONLY EVER CALL THIS ON CLIENT-SIDE!
// Private key should be loaded from key store
app.post("/transfer", async (req, res) => {
    const data = req.body;
    const paraId = database.getUser(data.eth);
    await bridgeRelay.transferFunds({
        userParaId: paraId,
        userPublic: data.eth,
        userPrivate: data.ethPriv,
        amount: data.amount
    });
    res.sendStatus(200);
});
// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
