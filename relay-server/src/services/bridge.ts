import { IJurToken, IBridgeContract } from "./ethRelay"
import { ISubstrateBridge } from "./parachainRelay";
import { KeyringPair } from '@polkadot/keyring/types';
import { Ok, Err, Result, None } from "ts-results";

export interface TransferEnvelope {
    userPublic: string,
    userPrivate: string,
    userParaId: KeyringPair,
    amount: number
}
/** A facade for the bridges */
export class Bridge {
    ethToken: IJurToken;
    ethBridge: IBridgeContract;
    substrateBridge: ISubstrateBridge;

    constructor(ethToken: IJurToken, ethBridge: IBridgeContract, substrateBridge: ISubstrateBridge) {
        this.ethToken = ethToken;
        this.ethBridge = ethBridge;
        this.substrateBridge = substrateBridge;
    }

    async transferFunds(envelope: TransferEnvelope) : Promise<Result<None, Error>> {
        return await this.ethBridge.lockFunds(envelope.userPublic, envelope.userPrivate, envelope.amount);
    }

}