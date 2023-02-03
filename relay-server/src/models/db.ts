import { KeyringPair } from '@polkadot/keyring/types';
import { Keyring  } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { Result, Unit } from 'true-myth';

const userExistsError = new Error("user already exists");
const userDoesntExistError = new Error("user does not exist");


export interface IDatabase {
    registerUser(ethAddress: string, keyUri: string): Promise<Result<Unit, Error>>;
    getUser(ethAddress: string): Result<KeyringPair, Error>;
}

export class MemoryDatabase implements IDatabase {
    userMap: Map<string, KeyringPair>

    constructor() {
        this.userMap = new Map<string, KeyringPair>();
    }

    async registerUser(ethAddress: string, keyUri: string): Promise<Result<Unit, Error>>{
        await cryptoWaitReady();
        const keyring = new Keyring({ type: 'sr25519' });
        const pair = keyring.createFromUri(keyUri);
        if (this.userMap.has(ethAddress)) {
            return Result.err(userExistsError)
        } else {
            this.userMap.set(ethAddress, pair);
            return Result.ok(Unit)
        }
    }

    getUser(ethAddress: string): Result<KeyringPair, Error> {
        if (this.userMap.has(ethAddress)) {
            return Result.ok(this.userMap.get(ethAddress)!);
        } else {
            return Result.err(userDoesntExistError);
        }
    }
}