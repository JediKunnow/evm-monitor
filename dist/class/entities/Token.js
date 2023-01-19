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
exports.Token = void 0;
const utils_1 = require("../utils");
const base_1 = require("../base");
const shapes_1 = require("../shapes");
class Token extends base_1.Entity {
    constructor(params) {
        super({
            shape: new shapes_1.TokenShape(params),
            abi: Token.ABI,
            required: ['id', 'network_id', 'created_at'],
            table: Token.table
        });
        this.shape = params;
    }
    get should_save() {
        if (this.shape.totalSupply)
            return this.shape.totalSupply > 0;
        return false;
    }
    resolve(safe) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = new shapes_1.TokenShape(this.shape);
            if (safe.w3 === undefined)
                throw new Error("Resolve failed due an invalid instance of Web3 Provided.");
            try {
                var myContractInstance = new safe.w3.eth.Contract(this.abi, this.shape.address);
                try {
                    result.circulatingSupply = yield utils_1.BlockExplorer.get_circulating_supply(safe.network, this.shape.address);
                }
                catch (e) { }
                try {
                    result.name = yield myContractInstance.methods.name().call();
                }
                catch (e) { }
                try {
                    result.symbol = yield myContractInstance.methods.symbol().call();
                }
                catch (e) { }
                try {
                    result.totalSupply = yield myContractInstance.methods.totalSupply().call();
                }
                catch (e) { }
                try {
                    result.owner = yield myContractInstance.methods.owner().call();
                }
                catch (e) { }
                if (result.owner !== undefined) {
                    try {
                        result.ownerBalance = yield utils_1.BlockExplorer.get_owner_balance(safe.network, this.shape.address, result.owner);
                    }
                    catch (e) { }
                }
                else { }
                this.shape = result;
                return this;
            }
            catch (err) {
                console.log(err);
                return this;
            }
        });
    }
    static get(db, condition) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = yield db.query(`SELECT * from ${this.table} WHERE ${condition} LIMIT 1`);
            if (r === null)
                return null;
            if (r.length == 0)
                return null;
            let x = r[0];
            return new Token({
                id: x['id'],
                network_id: x['network_id'],
                address: x['address'],
                name: x['name'],
                symbol: x['symbol'],
                totalSupply: x['totalSupply'],
                circulatingSupply: x['circulatingSupply'],
                owner: x['owner'],
                ownerBalance: x['ownerBalance'],
                score: x['score'],
                created_at: x['created_at']
            });
        });
    }
    markAsSelected(db) {
        return __awaiter(this, void 0, void 0, function* () {
            this.shape.score = 1;
            console.log(`Network ID: ${this.shape.network_id}`);
            yield this.save(db);
            return this;
        });
    }
}
exports.Token = Token;
Token.uid = "Token";
Token.ABI = require('../../abis/erc20.json').abi;
Token.filterRules = {
    rule: 'name()',
    for: Token.uid,
    next: {
        rule: 'symbol()',
        for: Token.uid,
        next: {
            rule: 'decimals()',
            for: Token.uid,
            next: {
                rule: 'totalSupply()',
                for: Token.uid,
                next: {
                    rule: 'balanceOf()',
                    for: Token.uid,
                }
            }
        }
    }
};
Token.table = "tokens";
//# sourceMappingURL=Token.js.map