import { TokenContract, BridgeContract } from "./ethRelay"
import { ParachainBridge } from "./parachainRelay";
import { KeyringPair } from '@polkadot/keyring/types';
import { Database } from "../models/db";
import { NonNegativeInteger } from "../utils/utils";

export interface TransferEnvelope {
    userPublic: string,
    userPrivate: string,
    userParaId: KeyringPair,
    amount: number
}
// A facade for the bridges
export class Bridge {
    ethToken: TokenContract;
    ethBridge: BridgeContract;
    substrateBridge: ParachainBridge;

    constructor(ethToken: TokenContract, ethBridge: BridgeContract, substrateBridge: ParachainBridge) {
        this.ethToken = ethToken;
        this.ethBridge = ethBridge;
        this.substrateBridge = substrateBridge;
    }

    async transferFunds(envelope: TransferEnvelope) {
        await this.ethBridge.lockFunds(envelope.userPublic, envelope.userPrivate, envelope.amount);
        // await this.substrateBridge.mintSubstrate(envelope.userPublic, envelope.userParaId, envelope.amount);
    }

}