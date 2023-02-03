import { KeyringPair } from "@polkadot/keyring/types";
import Web3 from "web3";
import { Contract } from "web3-eth-contract"
import { AbiItem } from "web3-utils";
import { Result, Unit } from 'true-myth';
import { Logger } from "tslog";


const log = new Logger();

import * as JURToken from "../config/JURToken.json";
import * as JURBridge from"../config/JURBridge.json";
import { getTrace, invalidAmountError } from "../utils/utils";


const tokenAbi = JURToken.abi;
const bridgeAbi = JURBridge.abi;

const txQueryError = new Error("could not query evm for transaction parameters");
const txRejectedError = new Error("evm rejected the submitted transaction");

const bridgeApprovalRejectedError = new Error("the token contract rejected the bridge contract approval request");
const bridgeLockError = new Error("funds could be transfered into the bridge to be locked");

interface IContract {
  ownerKey: string;
  contractMetadata: {contract: Contract, address: string};
  web3: Web3
}

export interface IJurToken extends IContract {
  ownerPublic: string;
  /** Transfer some JUR funds to a wallet on ethereum
   * @param {string} to - The eth wallet to transfer funds to
   * @param {number} amount - The amount of eth funds to transfer to wallet, must be non-negative
   * @returns {Promise<Result<Unit, Error>>} Empty {@link Result} if successful otherwise {@link Error}
   */
  transferJUR(to: string, amount: number) : Promise<Result<Unit, Error>>
}

export interface IBridgeContract extends IContract {
  tokenContract: IJurToken;

  /** 
   * Locks funds in a bridge contract
   * @param {string} source - The account with funds you wish to transfer
   * @param {string} sourceKey - The account's private keys to sign the transaction
   * @param {number} amount - The amount of JUR tokens you want to send to substrate, must be non-negative
   * @returns {Promise<Result<Unit, Error>>} Empty {@link Result} if successful otherwise {@link Error}
   *  */
  lockFunds(source: string, sourceKey: string, amount: number): Promise<Result<Unit, Error>>
}

export class TokenContract implements IJurToken {
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

    async transferJUR(to: string, amount: number) : Promise<Result<Unit, Error>> {
        if (amount <= 0) {
          return Result.err(invalidAmountError);
        }
        // Construct transaction
        const transferData = this.contractMetadata.contract.methods.transfer(to, `${amount}`).encodeABI();
        try {
          log.info("Getting gas price and nonce")
          const nonce = await this.web3.eth.getTransactionCount(this.ownerPublic);
          const gasPrice = await this.web3.eth.getGasPrice();
          try {
            log.info("Sending signed transaction")
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
            await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction!);
            return Result.ok(Unit)
          } catch(error) {
            log.error(getTrace(error));
            return Result.err(txRejectedError);
          }
        } catch(error) {
          log.error(getTrace(error));
          return Result.err(txQueryError);
        }
        
      }
}

export class BridgeContract implements IBridgeContract {
    tokenContract: IJurToken;
    contractMetadata: {contract: Contract, address: string};
    ownerKey: string;
    web3: Web3;


    constructor(contractAddress:string, ownerKey: string, tokenContract: IJurToken, host: string) {
        this.web3  = new Web3(Web3.givenProvider || host);
        this.tokenContract = tokenContract;
        this.contractMetadata = {
            contract: new this.web3.eth.Contract(bridgeAbi as unknown as AbiItem, contractAddress),
            address: contractAddress
        };
        this.ownerKey = ownerKey;
    }

    async lockFunds(source: string, sourceKey: string, amount: number) : Promise<Result<Unit, Error>> {
      if (amount <= 0) {
        return Result.err(invalidAmountError);
      }
      try {
        log.info("Setting approval on token contract")
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
        await this.web3.eth.sendSignedTransaction(signedApprovalTransaction.rawTransaction!);

        try {
          log.info("Locking funds on bridge contract")
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
          await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction!);
          return Result.ok(Unit)

        } catch(error) {
          log.error(getTrace(error));
          return Result.err(bridgeLockError);
        }

      } catch(error) {
        log.error(getTrace(error));
        return Result.err(bridgeApprovalRejectedError);
      }
    }
      /** A hook listening for events emitted by the lock that mints tokens on the substrate contract
       * @param {(from: string, to: KeyringPair, value: number) => Promise<Result<Unit, Error>>} hook - A callback to transfer the funds on successful lock
       * @param {(ethAddress: string) => Result<KeyringPair, Error>} destinationGetter - A callback to get the mapped substrate keychain for the given ethAddress
       */
      attachTransferHook(hook: (from: string, to: KeyringPair, value: number) => Promise<Result<Unit, Error>>, destinationGetter: (ethAddress: string) => Result<KeyringPair, Error>) {
        this.contractMetadata.contract.events.SwapInitiated({}, async (error: any, event: any) => {
            if(error) {
              log.error(error)
              return;
            }
            log.info("Transferring funds to substrate")
            const userKeypair = destinationGetter(event.returnValues.from);
            if (userKeypair.isErr) {
              log.error(userKeypair.error.message)
            } else if (userKeypair.isOk) {
              const transferResult = await hook(event.returnValues.from, userKeypair.value, event.returnValues.value);
              if (transferResult.isErr) {
                log.error(transferResult.error.message);
              }
            }
          });
      }
}