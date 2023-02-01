import { KeyringPair } from '@polkadot/keyring/types';
import { Keyring  } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';

export class Database {
    userMap: Map<string, KeyringPair>

    constructor() {
        this.userMap = new Map<string, KeyringPair>();
    }

    async registerUser(ethAddress: string, keyUri: string){
        await cryptoWaitReady();
        const keyring = new Keyring({ type: 'sr25519' });
        const pair = keyring.createFromUri(keyUri);
        this.userMap.set(ethAddress, pair);
    }

    getUser(ethAddress: string): KeyringPair {
        return this.userMap.get(ethAddress)!;
    }
}