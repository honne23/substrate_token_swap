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
const database = new db_1.MemoryDatabase();
// Attach transferhook
bridgeContract.attachTransferHook((from, to, value) => parachainBridge.mintSubstrate(from, to, value), (ethAddress) => database.getUser(ethAddress));
const bridgeRelay = new bridge_1.Bridge(tokenContract, bridgeContract, parachainBridge);
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
const port = 8080; // default port to listen
// Server-side secure
app.post("/register", async (req, res) => {
    const data = req.body;
    const userRegisterResult = await database.registerUser(data.eth, data.uri);
    if (userRegisterResult.ok) {
        res.sendStatus(201);
    }
    else {
        res.sendStatus(409); // Conflict, already exists
    }
});
// Server-side secure
app.post("/add-funds", async (req, res) => {
    const data = req.body;
    const transferResult = await tokenContract.transferJUR(data.eth, data.amount);
    if (transferResult.ok) {
        res.sendStatus(200);
    }
    else {
        res.sendStatus(500);
    }
});
// ONLY EVER CALL THIS ON CLIENT-SIDE!
// Private key should be loaded from key store
app.post("/transfer", async (req, res) => {
    const data = req.body;
    const paraId = database.getUser(data.eth);
    if (paraId.ok) {
        await bridgeRelay.transferFunds({
            userParaId: paraId.val,
            userPublic: data.eth,
            userPrivate: data.ethPriv,
            amount: data.amount
        });
        res.sendStatus(200);
    }
    else {
        res.sendStatus(404);
    }
});
// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNEQUE4QjtBQUM5Qiw4REFBcUM7QUFDckMsdUNBQXNEO0FBQ3RELCtDQUFpQztBQUNqQyxrREFBb0U7QUFDcEUsOERBQTREO0FBQzVELG9DQUE2QztBQUM3Qyw4Q0FBMkM7QUFHM0MsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRWhCLE1BQU0sYUFBYSxHQUFHLElBQUksd0JBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEyQixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXNCLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBbUIsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsQ0FBQyxDQUFBO0FBQzVLLE1BQU0sY0FBYyxHQUFHLElBQUkseUJBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUE0QixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXNCLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxDQUFDLENBQUE7QUFFN0osa0JBQWtCO0FBQ2xCLE1BQU0sVUFBVSxHQUFHLElBQUksZ0JBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWUsQ0FBQyxDQUFDO0FBQy9ELE1BQU0sZUFBZSxHQUFHLElBQUksZ0NBQWUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFrQixFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFrQixDQUFDLENBQUM7QUFFeEgsTUFBTSxRQUFRLEdBQUcsSUFBSSxtQkFBYyxFQUFFLENBQUE7QUFFckMsc0JBQXNCO0FBQ3RCLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFlLEVBQUUsS0FBYSxFQUFFLEVBQUUs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