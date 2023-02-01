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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParachainBridge = void 0;
const api_1 = require("@polkadot/api");
const api_contract_1 = require("@polkadot/api-contract");
const util_crypto_1 = require("@polkadot/util-crypto");
const bn_js_1 = require("bn.js");
const JURSubstrate = __importStar(require("../config/metadata.json"));
class ParachainBridge {
    constructor(uri, provider, contractAddress) {
        this.ownerPair = async () => {
            await (0, util_crypto_1.cryptoWaitReady)();
            const keyring = new api_1.Keyring({ type: 'sr25519' });
            return keyring.createFromUri(uri);
        };
        this.provider = provider;
        this.contract = (api) => new api_contract_1.ContractPromise(api, JURSubstrate, contractAddress);
    }
    async mintSubstrate(from, to, value) {
        const api = await api_1.ApiPromise.create({ provider: this.provider, noInitWarn: true });
        // Workaround from https://github.com/polkadot-js/api/issues/5255
        let gasLimit = api.registry.createType("WeightV2", {
            refTime: new bn_js_1.BN("10000000000"),
            proofSize: new bn_js_1.BN("10000000000"),
        });
        const queryOptions = { storageDepositLimit: null, gasLimit };
        const { gasRequired, storageDeposit, result } = await this.contract(api).query.mintBridge((await this.ownerPair()).address, queryOptions, from, to.address, value);
        gasLimit = api.registry.createType("WeightV2", {
            refTime: gasRequired.refTime.toBn(),
            proofSize: gasRequired.proofSize.toBn(),
        });
        const txOptions = { storageDepositLimit: null, gasLimit };
        await this.contract(api).tx.mintBridge(txOptions, from, to.address, value).signAndSend(to, (txResult) => {
            console.log(txResult.toHuman());
            if (txResult.status.isInBlock) {
                console.log('in a block');
            }
            else if (txResult.status.isFinalized) {
                console.log('finalized');
            }
        });
    }
}
exports.ParachainBridge = ParachainBridge;
