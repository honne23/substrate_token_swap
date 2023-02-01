import { ApiPromise, Keyring, WsProvider} from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { ContractPromise } from '@polkadot/api-contract';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import {BN} from "bn.js";

import * as JURSubstrate from "../config/metadata.json";


export class ParachainBridge {

    ownerPair: ()=> Promise<KeyringPair>;
    provider: WsProvider;
    contract: (api: ApiPromise) => ContractPromise;

    constructor(uri: string, provider: WsProvider, contractAddress: string) {
        this.ownerPair = async () => {
            await cryptoWaitReady()
            const keyring = new Keyring({ type: 'sr25519' });
            return keyring.createFromUri(uri)
        };
        this.provider = provider
        this.contract = (api: ApiPromise) => new ContractPromise(api, JURSubstrate, contractAddress);
    }



    async mintSubstrate(from: string, to: KeyringPair, value: number) {
        const api = await ApiPromise.create({ provider: this.provider, noInitWarn: true });

        // Workaround from https://github.com/polkadot-js/api/issues/5255
        let gasLimit: any = api.registry.createType("WeightV2", {
          refTime: new BN("10000000000"),
          proofSize: new BN("10000000000"),
        });

        const queryOptions = { storageDepositLimit: null , gasLimit }
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
        await this.contract(api).tx.mintBridge(
            txOptions,
            from,
            to.address,
            value).signAndSend(to, (txResult:any) => {
                console.log(txResult.toHuman());
                if (txResult.status.isInBlock) {
                console.log('in a block');
                } else if (txResult.status.isFinalized) {
                console.log('finalized');
                }
            });
      }
}