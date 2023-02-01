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
const JURToken = __importStar(require("../config/JURToken.json"));
const JURBridge = __importStar(require("../config/JURBridge.json"));
const tokenAbi = JURToken.abi;
const bridgeAbi = JURBridge.abi;
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
        const transferData = this.contractMetadata.contract.methods.transfer(to, `${amount}`).encodeABI();
        const nonce = await this.web3.eth.getTransactionCount(this.ownerPublic);
        const gasPrice = await this.web3.eth.getGasPrice();
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
        const transactionHash = await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        const ownerBalance = await this.contractMetadata.contract.methods.balanceOf(this.ownerPublic).call();
        const contractBalance = await this.contractMetadata.contract.methods.balanceOf(this.contractMetadata.address).call();
        const recipientBalance = await this.contractMetadata.contract.methods.balanceOf(to).call();
        console.log(`OWNER BALACE ${ownerBalance}`);
        console.log(`CONTRACT BALANCE ${contractBalance}`);
        console.log(`RECIPIENT BALANCE ${recipientBalance}`);
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
        const gasLimit = "216200";
        // approve
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
        const transactionHash = await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        const balance = await this.tokenContract.contractMetadata.contract.methods.balanceOf(this.contractMetadata.address).call();
        console.log(`Current bridge ballance: ${balance}`);
    }
    attachTransferHook(hook, destinationGetter) {
        this.contractMetadata.contract.events.SwapInitiated({}, async (error, event) => {
            console.log('Transfer event emitted: ', event.returnValues.from);
            await hook(event.returnValues.from, destinationGetter(event.returnValues.from), event.returnValues.value);
        });
    }
}
exports.BridgeContract = BridgeContract;
