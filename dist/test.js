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
const base_1 = require("./class/base");
const models_1 = require("./class/models");
const utils_1 = require("./class/utils");
const MasterChef_1 = require("./class/entities/MasterChef");
const entities_1 = require("./class/entities");
const battery = [
    (args) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const TEST_NAME = "getReserves";
        try {
            if (safe.w3 === undefined)
                throw new Error();
            let contract = new (safe.w3).eth.Contract(abi, args.address);
            let code = yield ((_a = safe.w3) === null || _a === void 0 ? void 0 : _a.eth.getCode(contract.options.address));
            let has = yield (0, utils_1.has_method)(safe.w3, code, TEST_NAME);
            if (has === true) {
                let response = yield contract.methods[TEST_NAME]().call();
                console.log(TEST_NAME + ": %s", response);
            }
            else
                console.log(TEST_NAME + ": fail");
        }
        catch (err) {
            console.log(TEST_NAME + ": failed with error" + err);
        }
    }),
    (args) => __awaiter(void 0, void 0, void 0, function* () {
        const TEST_NAME = "factory";
        try {
            if (safe.w3 === undefined)
                throw new Error();
            let contract = new safe.w3.eth.Contract(abi, args.address);
            let code = yield safe.w3.eth.getCode(contract.options.address);
            let has = yield (0, utils_1.has_method)(safe.w3, code, TEST_NAME);
            if (has === true) {
                let response = yield contract.methods[TEST_NAME]().call();
                console.log(TEST_NAME + ": %s", response);
            }
            else
                console.log(TEST_NAME + ": fail");
        }
        catch (err) {
            console.log(TEST_NAME + ": failed with error");
        }
    }),
    (args) => __awaiter(void 0, void 0, void 0, function* () {
        const TEST_NAME = "name";
        try {
            if (safe.w3 === undefined)
                throw new Error();
            let contract = new safe.w3.eth.Contract(abi, args.address);
            let response = yield contract.methods[TEST_NAME]().call();
            console.log(TEST_NAME + ": %s", response);
        }
        catch (err) {
            console.log(TEST_NAME + ": failed with error");
        }
    }),
    (args) => __awaiter(void 0, void 0, void 0, function* () {
        const TEST_NAME = "deposit";
        try {
            if (safe.w3 === undefined)
                throw new Error();
            let contract = new safe.w3.eth.Contract(abi, args.address);
            let code = yield safe.w3.eth.getCode(contract.options.address);
            let has = yield (0, utils_1.has_method)(safe.w3, code, TEST_NAME);
            if (has === true) {
                let response = yield contract.methods[TEST_NAME]().call();
                console.log(TEST_NAME + ": %s", response);
            }
            else
                console.log(TEST_NAME + ": fail");
        }
        catch (err) {
            console.log(TEST_NAME + ": failed with error");
        }
    }),
    (args) => __awaiter(void 0, void 0, void 0, function* () {
        const TEST_NAME = "symbol";
        try {
            if (safe.w3 === undefined)
                throw new Error();
            let contract = new safe.w3.eth.Contract(abi, args.address);
            let code = yield safe.w3.eth.getCode(contract.options.address);
            let has = yield (0, utils_1.has_method)(safe.w3, code, TEST_NAME);
            if (has === true) {
                let response = yield contract.methods[TEST_NAME]().call();
                console.log(TEST_NAME + ": %s", response);
            }
            else
                console.log(TEST_NAME + ": fail");
        }
        catch (err) {
            console.log(TEST_NAME + ": failed with error");
        }
    }),
    (args) => __awaiter(void 0, void 0, void 0, function* () {
        const TEST_NAME = "getPairs";
        try {
            if (safe.w3 === undefined)
                throw new Error();
            let mc = new MasterChef_1.MasterChef({
                address: args.address,
                created_at: new Date(),
                network_id: 2
            });
            let pairs = yield mc.getPairs(safe);
            if (pairs.length > 0) {
                console.log(TEST_NAME + ": %s", pairs.length);
            }
            else
                console.log(TEST_NAME + ": fail");
        }
        catch (err) {
            console.log(TEST_NAME + ": failed with error: %s", err);
        }
    }),
    (args) => __awaiter(void 0, void 0, void 0, function* () {
        const TEST_NAME = "getPrice";
        try {
            if (safe.w3 === undefined)
                throw new Error();
            let price = yield (0, utils_1.getPrice)({
                w3: safe.w3,
                router_address: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
                path: [
                    "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1",
                    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
                ]
            });
            console.log(TEST_NAME + ": %s", price);
        }
        catch (err) {
            console.log(TEST_NAME + ": failed with error: %s", err);
        }
    }),
    (args) => __awaiter(void 0, void 0, void 0, function* () {
        const TEST_NAME = "Pair.tvl()";
        try {
            if (safe.w3 === undefined)
                throw new Error();
            let pair = new entities_1.Pair({
                address: "0xadbf1854e5883eb8aa7baf50705338739e558e5b",
                created_at: new Date(),
                network_id: 2
            });
            let resolved = yield pair.resolve(safe);
            let tvl = yield resolved.tvl({ safe: safe, router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff" });
            console.log(TEST_NAME + ": %s", tvl);
        }
        catch (err) {
            console.log(TEST_NAME + ": failed with error: %s", err);
        }
    }),
    (args) => __awaiter(void 0, void 0, void 0, function* () {
        const TEST_NAME = "Pair.getPrice()";
        try {
            if (safe.w3 === undefined)
                throw new Error();
            let pair = new entities_1.Pair({
                address: "0xadbf1854e5883eb8aa7baf50705338739e558e5b",
                created_at: new Date(),
                network_id: 2
            });
            let resolved = yield pair.resolve(safe);
            let price = yield resolved.getPrice(safe, "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff");
            console.log(TEST_NAME + ": %s", price);
        }
        catch (err) {
            console.log(TEST_NAME + ": failed with error: %s", err);
        }
    }),
    (args) => __awaiter(void 0, void 0, void 0, function* () {
        const TEST_NAME = "MasterChef.tvl()";
        try {
            if (safe.w3 === undefined)
                throw new Error();
            let mc = new MasterChef_1.MasterChef({
                address: args.address,
                created_at: new Date(),
                network_id: 2
            });
            let tvl = yield mc.tvl({ safe: safe, router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff" });
            console.log(TEST_NAME + ": %s $", tvl);
        }
        catch (err) {
            console.log(TEST_NAME + ": failed with error: %s", err);
        }
    }),
];
const config = require('./config/config.js').config;
let net = config.networks.find(el => el.name == config.network);
if (net === undefined) {
    console.log("Wrong Network.");
    process.exit();
}
const safe = new base_1.SafeWeb3({ network: new models_1.Network(net) });
let abi = require('./abis/masterchef.json');
if (safe.load()) {
    for (let t of battery) {
        try {
            t({ safe: safe, address: "0xB664c98548CEbf7024F899e32E467dff00311918", abi: abi })
                .then();
        }
        catch (err) { }
    }
}
//# sourceMappingURL=test.js.map