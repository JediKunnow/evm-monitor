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
const entities_1 = require("../class/entities");
const utils_1 = require("../class/utils");
const config = require('../config/config.js').config;
const fnScan = (scanner, receipt) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let contractAddress = (receipt.contractAddress !== undefined) ? receipt.contractAddress : "";
    if (contractAddress.length > 0) {
        if (!scanner.safe.w3)
            throw new Error("SafeWeb3 down.");
        (_a = scanner.safe.w3) === null || _a === void 0 ? void 0 : _a.eth.getCode(contractAddress).then((opcode) => {
            if (opcode != '0x0') {
                scanner.filter.load({ code: opcode, address: contractAddress }).filter().then((entity_name) => {
                    if (entity_name === null)
                        return;
                    base_1.EntityFactory.issue(entity_name, {
                        address: contractAddress,
                        network_id: scanner.network.db_id,
                        created_at: new Date()
                    })
                        .resolve(scanner.safe)
                        .then((e) => {
                        if (e instanceof entities_1.Token) {
                            console.log(`${utils_1.Colors.BRIGHT_GREEN}[FILTER] ${entity_name} @${receipt.contractAddress}${utils_1.Colors.RESET}`);
                            e.create(scanner.dbengine)
                                .then((id) => {
                                if (id)
                                    console.log(`${utils_1.Colors.BRIGHT_GREEN}[FILTER] ${entity_name} @${receipt.contractAddress} stored with id {${id}}${utils_1.Colors.RESET}`);
                            });
                        }
                    }).catch((err) => {
                        console.log(`${utils_1.Colors.RED}${entity_name}[RESOLVE] ${err} ${utils_1.Colors.RESET}`);
                    });
                });
            }
        }).catch((err) => {
            if (scanner.LOG)
                console.log(`${utils_1.Colors.RED}[FNSCAN] ${err} ${utils_1.Colors.RESET}`);
        });
    }
});
const app = new base_1.App({
    config: config,
    scanHandler: fnScan
});
app.run().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=erc20_discovery.js.map