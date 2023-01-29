const Web3 = require("web3");
const { AbiItem } = require('web3-utils');
const JURToken = require("./JURToken.json");
const JURBridge = require("./JURBridge.json");
const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

// Initialise the contract
const tokenContractAddress = "0x61bCB79E8A7BEFd8B2AA99599108D61Fa6834847";
const tokenAbi = JURToken.abi;
const tokenContract = new web3.eth.Contract(tokenAbi, tokenContractAddress);

// Initialise the bridge contract
const bridgeContractAddress = "0xa3Ebdb3F7Db0aa68ccB425638cA4B4601B29939F";
const bridgeAbi = JURBridge.abi;
const bridgeContract = new web3.eth.Contract(bridgeAbi, bridgeContractAddress);



// Contract owner
const fromAddress = "0xEBe107b3A517e6F8a3A8437D81bBa52CB6f89CD4";

// Owner privateKey
const privateKey = "0xe1533ac6abd58bd7a3865940c4c18d90c870b62a8990543c0a623537677718b6";

type NonNegativeInteger<T extends number> =
    number extends T 
        ? never 
        : `${T}` extends `-${string}` | `${string}.${string}`
            ? never 
            : T;

async function transferJUR<N extends number>(from: string, to: string, amount: NonNegativeInteger<N>) {
  const transferData = tokenContract.methods.transfer(to, `${amount}`).encodeABI();
  const nonce = await web3.eth.getTransactionCount(from);
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = "216200";
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
  console.log("Transaction Hash:", transactionHash);
  const balance = await tokenContract.methods.balanceOf(from).call();
  console.log(balance);
}

async function toSubstrate<N extends number>(source: string, sourceKey: string, amount: NonNegativeInteger<N>) {
  const transferData = bridgeContract.methods.transfer(source, `${amount}`).encodeABI();
  const nonce = await web3.eth.getTransactionCount(source);
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = "216200";
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
  console.log("Transaction Hash:", transactionHash);
  const balance = await bridgeContract.methods.balanceOf(bridgeContractAddress).call();
  console.log(`Current bridge ballance: ${balance}`);
}

const recipient = "0xAc4f3eE13637376F1305233D2c01238087DAa79a";
const recipientKey = "0xeca4f27d24584df2dba5aab6d0c5ad334b3a826acdaf121aac9c04bbc94346a2"
transferJUR(fromAddress, recipient, 10).then(()=>{
  return toSubstrate(recipient, recipientKey, 5);
});
