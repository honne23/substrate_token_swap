"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bridge = void 0;
/** A facade for the bridges */
class Bridge {
    constructor(ethToken, ethBridge, substrateBridge) {
        this.ethToken = ethToken;
        this.ethBridge = ethBridge;
        this.substrateBridge = substrateBridge;
    }
    async transferFunds(envelope) {
        return await this.ethBridge.lockFunds(envelope.userPublic, envelope.userPrivate, envelope.amount);
    }
}
exports.Bridge = Bridge;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJpZGdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL2JyaWRnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFXQSwrQkFBK0I7QUFDL0IsTUFBYSxNQUFNO0lBS2YsWUFBWSxRQUFtQixFQUFFLFNBQTBCLEVBQUUsZUFBaUM7UUFDMUYsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7SUFDM0MsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBMEI7UUFDMUMsT0FBTyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEcsQ0FBQztDQUVKO0FBZkQsd0JBZUMifQ==