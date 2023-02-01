import Web3 from "web3";
import { AbiItem } from "web3-utils";

import JURToken from "../config/JURToken.json";
import JURBridge from "../config/JURBridge.json";

export async function transferJUR<N extends number>(from: string, to: string, amount: NonNegativeInteger<N>) {
    const transferData = tokenContract.methods.transfer(to, `${amount}`).encodeABI();
    let nonce = await web3.eth.getTransactionCount(from);
    let gasPrice = await web3.eth.getGasPrice();
    let gasLimit = "216200";
    const rawTransaction = {
      "from": from,
      "to": tokenContractAddress,
      "nonce": nonce,
      "gasPrice": web3.utils.toHex(gasPrice),
      "gasLimit": web3.utils.toHex(gasLimit),
      "data": transferData,
    };
    
    const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, privateKey);
    const transactionHash = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction!);
    const balance = await tokenContract.methods.balanceOf(from).call();
    console.log(balance);
  }

  async function lockFunds<N extends number>(source: string, sourceKey: string, amount: NonNegativeInteger<N>) {
    const gasLimit = "216200";
    // approve
    const approvalData = tokenContract.methods.approve(bridgeContractAddress, `${amount}`).encodeABI();
    let nonce = await web3.eth.getTransactionCount(source);
    let gasPrice = await web3.eth.getGasPrice();
    const approvalTransaction = {
      "from": source,
      "to": tokenContractAddress,
      "nonce": nonce,
      "gasPrice": web3.utils.toHex(gasPrice),
      "gasLimit": web3.utils.toHex(gasLimit),
      "data": approvalData,
    };
    const signedApprovalTransaction = await web3.eth.accounts.signTransaction(approvalTransaction, sourceKey);
    await web3.eth.sendSignedTransaction(signedApprovalTransaction.rawTransaction!);
  
  
  
    const transferData = bridgeContract.methods.transfer(source, `${amount}`).encodeABI();
    nonce = await web3.eth.getTransactionCount(source);
    gasPrice = await web3.eth.getGasPrice();
    const rawTransaction = {
      "from": source,
      "to": bridgeContractAddress,
      "nonce": nonce,
      "gasPrice": web3.utils.toHex(gasPrice),
      "gasLimit": web3.utils.toHex(gasLimit),
      "data": transferData,
    };
    const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, sourceKey);
    const transactionHash = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction!);
    const balance = await tokenContract.methods.balanceOf(bridgeContractAddress).call();
    console.log(`Current bridge ballance: ${balance}`);
  }