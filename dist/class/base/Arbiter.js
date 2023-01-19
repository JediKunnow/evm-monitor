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
exports.Arbiter = void 0;
const entities_1 = require("../entities");
const Factory_1 = require("../models/Factory");
const utils_1 = require("../utils");
class Arbiter {
    constructor({ safe, db }) {
        this.safe = safe;
        this.db = db;
        this.pairs = new Array();
        this.factories = new Array();
        this.fetched_pairs = new Map();
    }
    _loadPairsFromDB() {
        return __awaiter(this, void 0, void 0, function* () {
            entities_1.Pair.all(this.db).then((pairs) => {
                this.pairs = pairs;
            });
        });
    }
    addPairRuntime(pair) {
        this.pairs.push(pair);
    }
    loadFactoriesFromDB(factories) {
        return __awaiter(this, void 0, void 0, function* () {
            Factory_1.Factory.all(this.db).then((coll) => {
                coll.forEach(el => {
                    this.factories.push();
                });
            });
            if (factories) {
                factories.forEach(el => {
                    this.factories.push(el);
                });
            }
        });
    }
    fetchPairsFromFactory(factory) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.safe.w3 === undefined)
                throw new Error(`${utils_1.Colors.RED}[ARBITER] SAFEWEB3 Unavailable.${utils_1.Colors.RESET}`);
            let contract = new (this.safe.w3).eth.Contract(Factory_1.Factory.ABI, factory.address);
            let pairs = new Array();
            let pairs_count = yield contract.methods.allPairsLength().call();
            for (let i = 0; i < pairs_count; i++) {
                try {
                    pairs.push(yield contract.methods.allPairs(i).call());
                }
                catch (err) {
                    console.log(`${utils_1.Colors.RED}[ARBITER] SKIP PAIR${utils_1.Colors.RESET}`);
                }
            }
            this.fetched_pairs.set(factory, pairs);
        });
    }
    intersect() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.Arbiter = Arbiter;
//# sourceMappingURL=Arbiter.js.map