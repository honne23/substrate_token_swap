const Web3 = require("web3");
const { AbiItem } = require('web3-utils');
const JURToken = require("./JURToken.json");
const JURBridge = require("./JURBridge.json");
const JURSubstrate = require("./metadata.json")
//import { ApiPromise, WsProvider, Keyring  } from '@polkadot/api';
//import { ContractPromise } from '@polkadot/api-contract';
//import { stringToU8a,u8aToHex } from '@polkadot/util';
const { ApiPromise, WsProvider, Keyring  } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const { stringToU8a,u8aToHex } = require('@polkadot/util');
const {BN} = require("bn.js");

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

// Initialise the contract
const tokenContractAddress = "0x0ccdd6898ad5f2979fdf5e353342de6cfd2d470f";
const tokenAbi = JURToken.abi;
const tokenContract = new web3.eth.Contract(tokenAbi, tokenContractAddress);

// Initialise the bridge contract
const bridgeContractAddress = "0xae4f1cc7d1bf947b261ff87cd6238b1926504124";
const bridgeAbi = JURBridge.abi;
const bridgeContract = new web3.eth.Contract(bridgeAbi, bridgeContractAddress);

bridgeContract.events.SwapInitiated({}, (error: any, event: any) => {
  console.log('Transfer event emitted: ', event.returnValues.from);
  mintSubstrate(event.returnValues.from, "", event.returnValues.value);
});



// Contract owner
const fromAddress = "0x4Fac98244F62C16D1cC326b9E70d96b54cd1Ca55";

// Owner privateKey
const privateKey = "0x2aa8e844c38a11bbd80aad144a0acc64a9cf6487cefa41a0510a31de1bd43c87";

type NonNegativeInteger<T extends number> =
    number extends T 
        ? never 
        : `${T}` extends `-${string}` | `${string}.${string}`
            ? never 
            : T;

async function transferJUR<N extends number>(from: string, to: string, amount: NonNegativeInteger<N>) {
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

async function toSubstrate<N extends number>(source: string, sourceKey: string, amount: NonNegativeInteger<N>) {
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

async function mintSubstrate(from: string, to: string, value: number) {
  
  const keyring = new Keyring({ type: 'sr25519' });
  const pair = keyring.createFromUri("//Alice" )
  
  console.log('Polkadot', pair.address);

  const wsProvider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider: wsProvider, noInitWarn: true });

  // Workaround from https://github.com/polkadot-js/api/issues/5255
  let gasLimit: any = api.registry.createType("WeightV2", {
    refTime: new BN("10000000000"),
    proofSize: new BN("10000000000"),
  });
  const contract = new ContractPromise(api, JURSubstrate, "5CEyBcQ2RaqQhsyRFoXqVa41XhKrJccEr7Z55u7rrQt1SGQe");

  let options = { storageDepositLimit: null, gasLimit: gasLimit }
  const { gasRequired, storageDeposit, result } = await contract.query.mintBridge(
    pair.address,
    options,
    from,
    pair.address,
    10
  );
  console.log(gasRequired.toJSON().refTime)
  gasLimit = api.registry.createType("WeightV2", {
    refTime: new BN(gasRequired.toJSON().refTime),
    proofSize: new BN(gasRequired.toJSON().proofSize),
  });
  options = { storageDepositLimit: storageDeposit.toJSON().charge, gasLimit: gasLimit }
  await contract.tx.mintBridge(
    options,
    from,
    pair.address,
    10).signAndSend(pair, (result:any) => {
      console.log(result.toHuman());
      if (result.status.isInBlock) {
        console.log('in a block');
      } else if (result.status.isFinalized) {
        console.log('finalized');
      }
    });
  
}

const recipient = "0x7FB215F9Eb718e0757182Ae9a3A596Bcf0b1c40d";
const recipientKey = "0x9fed92bcfe9c078c15d3548e5763c17dde60715ce5fdca5c70f2bfd14b08a4e4"

transferJUR(fromAddress, recipient, 10).then(()=>{
  return toSubstrate(recipient, recipientKey, 5);
});
