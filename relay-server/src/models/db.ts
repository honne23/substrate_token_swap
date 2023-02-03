import { KeyringPair } from '@polkadot/keyring/types';
import { Keyring  } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { Ok, Err, Result, None } from "ts-results";

const userExistsError = new Error("user already exists");
const userDoesntExistError = new Error("user does not exist");


export interface IDatabase {
    /**
     * A function to register a mapping of an ETH wallet to a substrate wallet.
     * @param {string} ethAddress - The ETH address to register in the databse
     * @param {string} keyUri - The URI to generate the substrate keypair
     * @returns {Promise<Result<None, Error>>} Empty {@link Result} if successful otherwise {@link Error}
     */
    registerUser(ethAddress: string, keyUri: string): Promise<Result<None, Error>>;

    /**
     * A function used to get an existing user, throws an error if the user doesn't already exist.
     * @param {string} ethAddress - The ETH address key used to find the existing substrate keypair
     * @returns {Result<KeyringPair, Error>} Returns {@link KeyringPair} if successful otherwise {@link Error}
     */
    getUser(ethAddress: string): Result<KeyringPair, Error>;
}

export class MemoryDatabase implements IDatabase {
    userMap: Map<string, KeyringPair>

    constructor() {
        this.userMap = new Map<string, KeyringPair>();
    }

    async registerUser(ethAddress: string, keyUri: string): Promise<Result<None, Error>>{
        await cryptoWaitReady();
        const keyring = new Keyring({ type: 'sr25519' });
        const pair = keyring.createFromUri(keyUri);
        if (this.userMap.has(ethAddress)) {
            return Err(userExistsError)
        } else {
            this.userMap.set(ethAddress, pair);
            return Ok(None)
        }
    }

    getUser(ethAddress: string): Result<KeyringPair, Error> {
        if (this.userMap.has(ethAddress)) {
            return Ok(this.userMap.get(ethAddress)!);
        } else {
            return Err(userDoesntExistError);
        }
    }
}