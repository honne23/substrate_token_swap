import { ApiPromise, Keyring, WsProvider} from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { ContractPromise } from '@polkadot/api-contract';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { SimpleChannel } from "channel-ts";
import {BN} from "bn.js";

import * as JURSubstrate from "../config/metadata.json";
import { Ok, Err, Result, None, Option } from "ts-results";
import { Logger } from 'tslog';
import { getTrace, invalidAmountError } from '../utils/utils';
import { ISubmittableResult } from '@polkadot/types/types';

const log = new Logger();

const queryFailedError = new Error("could not query substrate");
const transactionFailedError = new Error("submitting substrate transaction failed");
const getBalanceFailedError = new Error("could not query balance on wallet")

export abstract class SubstrateContract {
    ownerPair: () => Promise<KeyringPair>;
    contract: (api: ApiPromise) => ContractPromise;
    provider: WsProvider;


    constructor(uri: string, provider: WsProvider, contractAddress: string) {
        this.ownerPair = async () => {
            await cryptoWaitReady()
            const keyring = new Keyring({ type: 'sr25519' });
            return keyring.createFromUri(uri)
        };
        this.contract = (api: ApiPromise) => new ContractPromise(api, JURSubstrate, contractAddress);

        this.provider = provider;
    }

    /**
     * 
     * @param {KeyringPair} wallet - The {@link KeyringPair} to inspect balance
     * @param {KeyringPair} caller - The function caller
     * @returns {Promise<Result<number, Error>>} Balance of wallet if successful otherwise {@link Error}
     */
    async getBalance(caller: KeyringPair, wallet: KeyringPair): Promise<Result<number, Error>> {
        try {
            const api = await ApiPromise.create({ provider: this.provider, noInitWarn: true });
            const callValue = await this.contract(api).query.balanceOf(caller.address, { gasLimit: this.defaultGas(api)}, wallet.address);
            if (callValue.result.isOk) {
                return Ok(callValue.output!.toPrimitive() as number);
            } else {
                return Err(new Error(`Could not get wallet ballance: ${callValue.result.asErr.toHuman()}`));
            }
        } catch (error: any) {
            log.error(getTrace(error));
            return Err(getBalanceFailedError);
        }
        
    }

    defaultGas(api: ApiPromise): any {
        return api.registry.createType("WeightV2", {
            refTime: new BN("10000000000"),
            proofSize: new BN("10000000000"),
          });
    }
}



export class ParachainBridge extends SubstrateContract {
    /**
     * A function that mints tokens on the substrate parachain of equivalent amount to those emitted in the ETH event
     * @param {string} from - ETH wallet of incoming funds
     * @param {KeyringPair} to - Substrate keyring to transfer funds to
     * @param {number} value - Non negative amount to transfer
     * @returns {Promise<Result<None, Error>>} Empty {@link Result} if successful otherwise {@link Error}
     */
    async mintSubstrate(from: string, to: KeyringPair, value: number): Promise<Result<None, Error>> {
        if (value <= 0) {
            return Err(invalidAmountError);
        }
        log.info("Connecting to substrate endpoint");
        const api = await ApiPromise.create({ provider: this.provider, noInitWarn: true });

        // Workaround from https://github.com/polkadot-js/api/issues/5255
        let gasLimit: any = api.registry.createType("WeightV2", {
          refTime: new BN("10000000000"),
          proofSize: new BN("10000000000"),
        });

        const queryOptions = { storageDepositLimit: null , gasLimit }
        try {
            log.info("Querying substrate contract for refTime and proofSize");
            const { gasRequired, storageDeposit, result } = await this.contract(api).query.mintBridge(
                (await this.ownerPair()).address,
                queryOptions,
                from,
                to.address,
                value
              );
              gasLimit = api.registry.createType("WeightV2", {
                refTime: gasRequired.refTime.toBn(),
                proofSize: gasRequired.proofSize.toBn(),
              });
              const txOptions = { storageDepositLimit: null, gasLimit }
              try {
                log.info("Executing transfer to substrate");
                const chan = new SimpleChannel<boolean>();
                this.contract(api).tx.mintBridge(
                    txOptions,
                    from,
                    to.address,
                    value).signAndSend(to, (txResult:ISubmittableResult) => {
                        if (txResult.isError) {
                            chan.send(false);
                        }
                        if (txResult.status.isInBlock) {
                            chan.send(true);
                        }
                    });
                const txResult = await chan.receive();
                if (txResult) {
                    return Ok(None);
                } else {
                    return Err(transactionFailedError);
                }
              } catch(error) {
                log.error(getTrace(error));
                return Err(transactionFailedError);
              }

        } catch(error) {
            log.error(getTrace(error));
            return Err(queryFailedError);
        }
      }

    
}