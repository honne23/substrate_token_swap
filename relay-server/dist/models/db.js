"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryDatabase = void 0;
const api_1 = require("@polkadot/api");
const util_crypto_1 = require("@polkadot/util-crypto");
const ts_results_1 = require("ts-results");
const userExistsError = new Error("user already exists");
const userDoesntExistError = new Error("user does not exist");
class MemoryDatabase {
    constructor() {
        this.userMap = new Map();
    }
    async registerUser(ethAddress, keyUri) {
        await (0, util_crypto_1.cryptoWaitReady)();
        const keyring = new api_1.Keyring({ type: 'sr25519' });
        const pair = keyring.createFromUri(keyUri);
        if (this.userMap.has(ethAddress)) {
            return (0, ts_results_1.Err)(userExistsError);
        }
        else {
            this.userMap.set(ethAddress, pair);
            return (0, ts_results_1.Ok)(ts_results_1.None);
        }
    }
    getUser(ethAddress) {
        if (this.userMap.has(ethAddress)) {
            return (0, ts_results_1.Ok)(this.userMap.get(ethAddress));
        }
        else {
            return (0, ts_results_1.Err)(userDoesntExistError);
        }
    }
}
exports.MemoryDatabase = MemoryDatabase;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWxzL2RiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVDQUF5QztBQUN6Qyx1REFBd0Q7QUFDeEQsMkNBQW1EO0FBRW5ELE1BQU0sZUFBZSxHQUFHLElBQUksS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDekQsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBb0I5RCxNQUFhLGNBQWM7SUFHdkI7UUFDSSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO0lBQ2xELENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLFVBQWtCLEVBQUUsTUFBYztRQUNqRCxNQUFNLElBQUEsNkJBQWUsR0FBRSxDQUFDO1FBQ3hCLE1BQU0sT0FBTyxHQUFHLElBQUksYUFBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDakQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzlCLE9BQU8sSUFBQSxnQkFBRyxFQUFDLGVBQWUsQ0FBQyxDQUFBO1NBQzlCO2FBQU07WUFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbkMsT0FBTyxJQUFBLGVBQUUsRUFBQyxpQkFBSSxDQUFDLENBQUE7U0FDbEI7SUFDTCxDQUFDO0lBRUQsT0FBTyxDQUFDLFVBQWtCO1FBQ3RCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDOUIsT0FBTyxJQUFBLGVBQUUsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUUsQ0FBQyxDQUFDO1NBQzVDO2FBQU07WUFDSCxPQUFPLElBQUEsZ0JBQUcsRUFBQyxvQkFBb0IsQ0FBQyxDQUFDO1NBQ3BDO0lBQ0wsQ0FBQztDQUNKO0FBMUJELHdDQTBCQyJ9