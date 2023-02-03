import { IJurToken, IBridgeContract } from "./ethRelay"
import { ISubstrateBridge } from "./parachainRelay";
import { KeyringPair } from '@polkadot/keyring/types';
import { Result, Unit } from "true-myth";

export interface TransferEnvelope {
    userPublic: string,
    userPrivate: string,
    userParaId: KeyringPair,
    amount: number
}
// A facade for the bridges
export class Bridge {
    ethToken: IJurToken;
    ethBridge: IBridgeContract;
    substrateBridge: ISubstrateBridge;

    constructor(ethToken: IJurToken, ethBridge: IBridgeContract, substrateBridge: ISubstrateBridge) {
        this.ethToken = ethToken;
        this.ethBridge = ethBridge;
        this.substrateBridge = substrateBridge;
    }

    async transferFunds(envelope: TransferEnvelope) : Promise<Result<Unit, Error>> {
        return await this.ethBridge.lockFunds(envelope.userPublic, envelope.userPrivate, envelope.amount);
    }

}