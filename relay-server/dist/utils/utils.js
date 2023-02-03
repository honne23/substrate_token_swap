"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrace = exports.invalidAmountError = void 0;
exports.invalidAmountError = new Error("invalid amount supplied");
function getTrace(error) {
    if (error instanceof Error)
        return error.message;
    return String(error);
}
exports.getTrace = getTrace;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBT2EsUUFBQSxrQkFBa0IsR0FBRyxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBRXZFLFNBQWdCLFFBQVEsQ0FBQyxLQUFjO0lBQ25DLElBQUksS0FBSyxZQUFZLEtBQUs7UUFBRSxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUE7SUFDaEQsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDdEIsQ0FBQztBQUhILDRCQUdHIn0=