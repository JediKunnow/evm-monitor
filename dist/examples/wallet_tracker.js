"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../class/base");
const config = require('../config/config.js').config;
const ADDRESS_TO_TRACK = "0x1111111254fb6c44bAC0beD2854e76F90643097d";
const fnScan = (scanner, receipt) => __awaiter(void 0, void 0, void 0, function* () {
    if (receipt.from == ADDRESS_TO_TRACK)
        console.log(`[SEND] ${ADDRESS_TO_TRACK} identified as sender in tx with hash: ${receipt.transactionHash}`);
    if (receipt.to == ADDRESS_TO_TRACK)
        console.log(`[RECEIVE] ${ADDRESS_TO_TRACK} identified as sender in tx with hash: ${receipt.transactionHash}`);
});
const app = new base_1.App({
    config: config,
    scanHandler: fnScan
});
app.run().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=wallet_tracker.js.map