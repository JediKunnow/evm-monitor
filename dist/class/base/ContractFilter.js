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
exports.ContractFilter = void 0;
const utils_1 = require("../utils");
class ContractFilter {
    constructor(web3) {
        if (web3.w3 === undefined)
            throw new Error("Cannot create filter due an invalid instance of Web3 Provided.");
        this.safe = web3;
        this.rules = { items: new Array() };
    }
    setRules(rules) { this.rules.items = rules; }
    load(contract) {
        this.contract = contract;
        return this;
    }
    filter() {
        return __awaiter(this, void 0, void 0, function* () {
            let recursive_filter = (inp) => __awaiter(this, void 0, void 0, function* () {
                if (this.contract === undefined)
                    return null;
                if (this.safe.w3 === undefined)
                    return null;
                let has = yield (0, utils_1.has_method)(this.safe.w3, this.contract.code, inp.rule);
                if (has === true) {
                    if (inp.next)
                        yield recursive_filter(inp.next);
                    return inp.for;
                }
                return null;
            });
            if (this.rules.items.length == 0) {
                console.log("Please load rules first.");
                return null;
            }
            if (!this.contract) {
                console.log("Please load contract first.");
                return null;
            }
            let result = null;
            for (let item of this.rules.items) {
                result = yield recursive_filter(item);
                if (result !== null)
                    return result;
            }
            return result;
        });
    }
    print() {
        let o = [];
        let iterate = (inp) => {
            o.push(inp);
            if (inp.next)
                iterate(inp.next);
        };
        if (this.rules.items.length > 0) {
            for (let x of this.rules.items)
                iterate(x);
            console.table(o, ["rule", "for"]);
        }
        else
            console.log("Load rules first.");
    }
}
exports.ContractFilter = ContractFilter;
//# sourceMappingURL=ContractFilter.js.map