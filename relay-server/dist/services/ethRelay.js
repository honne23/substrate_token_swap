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
exports.BridgeContract = exports.TokenContract = void 0;
const web3_1 = __importDefault(require("web3"));
const ts_results_1 = require("ts-results");
const tslog_1 = require("tslog");
const log = new tslog_1.Logger();
const JURToken = __importStar(require("../config/JURToken.json"));
const JURBridge = __importStar(require("../config/JURBridge.json"));
const utils_1 = require("../utils/utils");
const tokenAbi = JURToken.abi;
const bridgeAbi = JURBridge.abi;
const txQueryError = new Error("could not query evm for transaction parameters");
const txRejectedError = new Error("evm rejected the submitted transaction");
const bridgeApprovalRejectedError = new Error("the token contract rejected the bridge contract approval request");
const bridgeLockError = new Error("funds could be transfered into the bridge to be locked");
class TokenContract {
    constructor(contractAddress, ownerKey, ownerPublic, host) {
        this.web3 = new web3_1.default(web3_1.default.givenProvider || host);
        this.contractMetadata = {
            contract: new this.web3.eth.Contract(tokenAbi, contractAddress),
            address: contractAddress
        };
        this.ownerKey = ownerKey;
        this.ownerPublic = ownerPublic;
    }
    async transferJUR(to, amount) {
        if (amount <= 0) {
            return (0, ts_results_1.Err)(utils_1.invalidAmountError);
        }
        // Construct transaction
        const transferData = this.contractMetadata.contract.methods.transfer(to, `${amount}`).encodeABI();
        try {
            log.info("Getting gas price and nonce");
            const nonce = await this.web3.eth.getTransactionCount(this.ownerPublic);
            const gasPrice = await this.web3.eth.getGasPrice();
            try {
                log.info("Sending signed transaction");
                const gasLimit = "216200";
                const rawTransaction = {
                    "from": this.ownerPublic,
                    "to": this.contractMetadata.address,
                    "nonce": nonce,
                    "gasPrice": this.web3.utils.toHex(gasPrice),
                    "gasLimit": this.web3.utils.toHex(gasLimit),
                    "data": transferData,
                };
                const signedTransaction = await this.web3.eth.accounts.signTransaction(rawTransaction, this.ownerKey);
                await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
                return (0, ts_results_1.Ok)(ts_results_1.None);
            }
            catch (error) {
                log.error((0, utils_1.getTrace)(error));
                return (0, ts_results_1.Err)(txRejectedError);
            }
        }
        catch (error) {
            log.error((0, utils_1.getTrace)(error));
            return (0, ts_results_1.Err)(txQueryError);
        }
    }
}
exports.TokenContract = TokenContract;
class BridgeContract {
    constructor(contractAddress, ownerKey, tokenContract, host) {
        this.web3 = new web3_1.default(web3_1.default.givenProvider || host);
        this.tokenContract = tokenContract;
        this.contractMetadata = {
            contract: new this.web3.eth.Contract(bridgeAbi, contractAddress),
            address: contractAddress
        };
        this.ownerKey = ownerKey;
    }
    async lockFunds(source, sourceKey, amount) {
        if (amount <= 0) {
            return (0, ts_results_1.Err)(utils_1.invalidAmountError);
        }
        try {
            log.info("Setting approval on token contract");
            const gasLimit = "216200";
            const approvalData = this.tokenContract.contractMetadata.contract.methods.approve(this.contractMetadata.address, `${amount}`).encodeABI();
            let nonce = await this.web3.eth.getTransactionCount(source);
            let gasPrice = await this.web3.eth.getGasPrice();
            const approvalTransaction = {
                "from": source,
                "to": this.tokenContract.contractMetadata.address,
                "nonce": nonce,
                "gasPrice": this.web3.utils.toHex(gasPrice),
                "gasLimit": this.web3.utils.toHex(gasLimit),
                "data": approvalData,
            };
            const signedApprovalTransaction = await this.web3.eth.accounts.signTransaction(approvalTransaction, sourceKey);
            await this.web3.eth.sendSignedTransaction(signedApprovalTransaction.rawTransaction);
            try {
                log.info("Locking funds on bridge contract");
                const transferData = this.contractMetadata.contract.methods.transfer(source, `${amount}`).encodeABI();
                nonce = await this.web3.eth.getTransactionCount(source);
                gasPrice = await this.web3.eth.getGasPrice();
                const rawTransaction = {
                    "from": source,
                    "to": this.contractMetadata.address,
                    "nonce": nonce,
                    "gasPrice": this.web3.utils.toHex(gasPrice),
                    "gasLimit": this.web3.utils.toHex(gasLimit),
                    "data": transferData,
                };
                const signedTransaction = await this.web3.eth.accounts.signTransaction(rawTransaction, sourceKey);
                await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
                return (0, ts_results_1.Ok)(ts_results_1.None);
            }
            catch (error) {
                log.error((0, utils_1.getTrace)(error));
                return (0, ts_results_1.Err)(bridgeLockError);
            }
        }
        catch (error) {
            log.error((0, utils_1.getTrace)(error));
            return (0, ts_results_1.Err)(bridgeApprovalRejectedError);
        }
    }
    /** A hook listening for events emitted by the lock that mints tokens on the substrate contract
     * @param {(from: string, to: KeyringPair, value: number) => Promise<Result<None, Error>>} hook - A callback to transfer the funds on successful lock
     * @param {(ethAddress: string) => Result<KeyringPair, Error>} destinationGetter - A callback to get the mapped substrate keychain for the given ethAddress
     */
    attachTransferHook(hook, destinationGetter) {
        this.contractMetadata.contract.events.SwapInitiated({}, async (error, event) => {
            if (error) {
                log.error(error);
                return;
            }
            log.info("Transferring funds to substrate");
            const userKeypair = destinationGetter(event.returnValues.from);
            if (userKeypair.err) {
                log.error(userKeypair.val.message);
            }
            else if (userKeypair.ok) {
                const transferResult = await hook(event.returnValues.from, userKeypair.val, event.returnValues.value);
                if (transferResult.err) {
                    log.error(transferResult.val.message);
                }
            }
        });
    }
}
exports.BridgeContract = BridgeContract;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXRoUmVsYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvZXRoUmVsYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxnREFBd0I7QUFHeEIsMkNBQW1EO0FBQ25ELGlDQUErQjtBQUcvQixNQUFNLEdBQUcsR0FBRyxJQUFJLGNBQU0sRUFBRSxDQUFDO0FBRXpCLGtFQUFvRDtBQUNwRCxvRUFBcUQ7QUFDckQsMENBQThEO0FBRzlELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUM7QUFDOUIsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQztBQUVoQyxNQUFNLFlBQVksR0FBRyxJQUFJLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO0FBQ2pGLE1BQU0sZUFBZSxHQUFHLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7QUFFNUUsTUFBTSwyQkFBMkIsR0FBRyxJQUFJLEtBQUssQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO0FBQ2xILE1BQU0sZUFBZSxHQUFHLElBQUksS0FBSyxDQUFDLHdEQUF3RCxDQUFDLENBQUM7QUErQjVGLE1BQWEsYUFBYTtJQU10QixZQUFZLGVBQXNCLEVBQUUsUUFBZ0IsRUFBRSxXQUFtQixFQUFFLElBQVk7UUFDbkYsSUFBSSxDQUFDLElBQUksR0FBSSxJQUFJLGNBQUksQ0FBQyxjQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxnQkFBZ0IsR0FBRztZQUNwQixRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBOEIsRUFBRSxlQUFlLENBQUM7WUFDckYsT0FBTyxFQUFFLGVBQWU7U0FDM0IsQ0FBQztRQUNGLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxXQUFX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