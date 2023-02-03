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
const ts_results_1 = require("ts-results");
const tslog_1 = require("tslog");
const utils_1 = require("../utils/utils");
const log = new tslog_1.Logger();
const queryFailedError = new Error("could not query substrate");
const transactionFailedError = new Error("submitting substrate transaction failed");
class ParachainBridge {
    constructor(uri, provider, contractAddress) {
        this.ownerPair = async () => {
            await (0, util_crypto_1.cryptoWaitReady)();
            const keyring = new api_1.Keyring({ type: 'sr25519' });
            return keyring.createFromUri(uri);
        };
        this.contract = (api) => new api_contract_1.ContractPromise(api, JURSubstrate, contractAddress);
        this.provider = provider;
    }
    async mintSubstrate(from, to, value) {
        if (value <= 0) {
            return (0, ts_results_1.Err)(utils_1.invalidAmountError);
        }
        log.info("Connecting to substrate endpoint");
        const api = await api_1.ApiPromise.create({ provider: this.provider, noInitWarn: true });
        // Workaround from https://github.com/polkadot-js/api/issues/5255
        let gasLimit = api.registry.createType("WeightV2", {
            refTime: new bn_js_1.BN("10000000000"),
            proofSize: new bn_js_1.BN("10000000000"),
        });
        const queryOptions = { storageDepositLimit: null, gasLimit };
        try {
            log.info("Querying substrate contract for refTime and proofSize");
            const { gasRequired, storageDeposit, result } = await this.contract(api).query.mintBridge((await this.ownerPair()).address, queryOptions, from, to.address, value);
            gasLimit = api.registry.createType("WeightV2", {
                refTime: gasRequired.refTime.toBn(),
                proofSize: gasRequired.proofSize.toBn(),
            });
            const txOptions = { storageDepositLimit: null, gasLimit };
            try {
                log.info("Executing transfer to substrate");
                await this.contract(api).tx.mintBridge(txOptions, from, to.address, value).signAndSend(to, (txResult) => {
                    console.log(txResult.toHuman());
                    if (txResult.status.isInBlock) {
                        console.log('in a block');
                    }
                    else if (txResult.status.isFinalized) {
                        console.log('finalized');
                    }
                });
                log.info("Transfer to substrate successful");
                return (0, ts_results_1.Ok)(ts_results_1.None);
            }
            catch (error) {
                log.error((0, utils_1.getTrace)(error));
                return (0, ts_results_1.Err)(transactionFailedError);
            }
        }
        catch (error) {
            log.error((0, utils_1.getTrace)(error));
            return (0, ts_results_1.Err)(queryFailedError);
        }
    }
}
exports.ParachainBridge = ParachainBridge;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYWNoYWluUmVsYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvcGFyYWNoYWluUmVsYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBK0Q7QUFFL0QseURBQXlEO0FBQ3pELHVEQUF3RDtBQUN4RCxpQ0FBeUI7QUFFekIsc0VBQXdEO0FBQ3hELDJDQUFtRDtBQUNuRCxpQ0FBK0I7QUFDL0IsMENBQThEO0FBRTlELE1BQU0sR0FBRyxHQUFHLElBQUksY0FBTSxFQUFFLENBQUM7QUFFekIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQ2hFLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztBQW9CcEYsTUFBYSxlQUFlO0lBT3hCLFlBQVksR0FBVyxFQUFFLFFBQW9CLEVBQUUsZUFBdUI7UUFDbEUsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLElBQUksRUFBRTtZQUN4QixNQUFNLElBQUEsNkJBQWUsR0FBRSxDQUFBO1lBQ3ZCLE1BQU0sT0FBTyxHQUFHLElBQUksYUFBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDakQsT0FBTyxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JDLENBQUMsQ0FBQztRQUNGLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxHQUFlLEVBQUUsRUFBRSxDQUFDLElBQUksOEJBQWUsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRTdGLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzdCLENBQUM7SUFJRCxLQUFLLENBQUMsYUFBYSxDQUFDLElBQVksRUFBRSxFQUFlLEVBQUUsS0FBYTtRQUM1RCxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7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