"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const api_1 = require("@polkadot/api");
const util_crypto_1 = require("@polkadot/util-crypto");
class Database {
    constructor() {
        this.userMap = new Map();
    }
    async registerUser(ethAddress, keyUri) {
        await (0, util_crypto_1.cryptoWaitReady)();
        const keyring = new api_1.Keyring({ type: 'sr25519' });
        const pair = keyring.createFromUri(keyUri);
        this.userMap.set(ethAddress, pair);
    }
    getUser(ethAddress) {
        return this.userMap.get(ethAddress);
    }
}
exports.Database = Database;
