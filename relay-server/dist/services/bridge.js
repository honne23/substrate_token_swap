"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bridge = void 0;
// A facade for the bridges
class Bridge {
    constructor(ethToken, ethBridge, substrateBridge) {
        this.ethToken = ethToken;
        this.ethBridge = ethBridge;
        this.substrateBridge = substrateBridge;
    }
    async transferFunds(envelope) {
        await this.ethBridge.lockFunds(envelope.userPublic, envelope.userPrivate, envelope.amount);
        // await this.substrateBridge.mintSubstrate(envelope.userPublic, envelope.userParaId, envelope.amount);
    }
}
exports.Bridge = Bridge;
