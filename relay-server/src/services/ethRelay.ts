import { KeyringPair } from "@polkadot/keyring/types";
import Web3 from "web3";
import { Contract } from "web3-eth-contract"
import { AbiItem } from "web3-utils";
import { NonNegativeInteger } from "../utils/utils";

import * as JURToken from "../config/JURToken.json";
import * as JURBridge from"../config/JURBridge.json";


const tokenAbi = JURToken.abi;
const bridgeAbi = JURBridge.abi;

export class TokenContract {
    ownerKey: string;
    ownerPublic: string;
    contractMetadata: {contract: Contract, address: string};
    web3: Web3

    constructor(contractAddress:string, ownerKey: string, ownerPublic: string, host: string) {
        this.web3  = new Web3(Web3.givenProvider || host);
        this.contractMetadata = {
            contract: new this.web3.eth.Contract(tokenAbi as unknown as AbiItem, contractAddress),
            address: contractAddress
        };
        this.ownerKey = ownerKey;
        this.ownerPublic = ownerPublic;
    }

    async transferJUR(to: string, amount: number) {
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
        const transactionHash = await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction!);
        const ownerBalance = await this.contractMetadata.contract.methods.balanceOf(this.ownerPublic).call();
        const contractBalance = await this.contractMetadata.contract.methods.balanceOf(this.contractMetadata.address).call();
        const recipientBalance = await this.contractMetadata.contract.methods.balanceOf(to).call();
        console.log(`OWNER BALACE ${ownerBalance}`);
        console.log(`CONTRACT BALANCE ${contractBalance}`);
        console.log(`RECIPIENT BALANCE ${recipientBalance}`);
      }
}

export class BridgeContract {
    tokenContract: TokenContract;
    contractMetadata: {contract: Contract, address: string};
    ownerKey: string;
    web3: Web3;


    constructor(contractAddress:string, ownerKey: string, tokenContract: TokenContract, host: string) {
        this.web3  = new Web3(Web3.givenProvider || host);
        this.tokenContract = tokenContract;
        this.contractMetadata = {
            contract: new this.web3.eth.Contract(bridgeAbi as unknown as AbiItem, contractAddress),
            address: contractAddress
        };
        this.ownerKey = ownerKey;
    }

    async lockFunds(source: string, sourceKey: string, amount: number) {
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
        await this.web3.eth.sendSignedTransaction(signedApprovalTransaction.rawTransaction!);


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
        const transactionHash = await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction!);
        const balance = await this.tokenContract.contractMetadata.contract.methods.balanceOf(this.contractMetadata.address).call();
        console.log(`Current bridge ballance: ${balance}`);
      }

      attachTransferHook(hook: (from: string, to: KeyringPair, value: number) => Promise<void>, destinationGetter: (ethAddress: string) => KeyringPair) {
        this.contractMetadata.contract.events.SwapInitiated({}, async (error: any, event: any) => {
            console.log('Transfer event emitted: ', event.returnValues.from);
            await hook(event.returnValues.from, destinationGetter(event.returnValues.from), event.returnValues.value);
          });
      }
}