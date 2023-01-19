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
exports.Pair = void 0;
const base_1 = require("../base");
const shapes_1 = require("../shapes");
const _1 = require(".");
const ContractFilter_1 = require("../base/ContractFilter");
const bignumber_js_1 = require("bignumber.js");
const utils_1 = require("../utils");
class Pair extends base_1.Entity {
    constructor(params) {
        super({
            shape: new shapes_1.PairShape(params),
            abi: Pair.ABI,
            required: ['id', 'network_id', 'created_at'],
            table: 'pairs'
        });
        if (!(this.shape instanceof shapes_1.PairShape))
            throw new Error("Invalid Shape.");
    }
    get should_save() { return this.shape.token0 !== undefined && this.shape.token1 !== undefined; }
    resolve(safe) {
        return __awaiter(this, void 0, void 0, function* () {
            if (safe.w3 === undefined)
                throw new Error("Resolve failed due an invalid instance of Web3 Provided.");
            let result = new shapes_1.PairShape(this.shape);
            try {
                var myContractInstance = new (safe.w3).eth.Contract(this.abi, this.shape.address);
                try {
                    result.name = yield myContractInstance.methods.name().call();
                }
                catch (e) { }
                try {
                    result.symbol = yield myContractInstance.methods.symbol().call();
                }
                catch (e) { }
                try {
                    result.token0 = yield myContractInstance.methods.token0().call();
                }
                catch (e) { }
                try {
                    result.token1 = yield myContractInstance.methods.token1().call();
                }
                catch (e) { }
                try {
                    result.reserve0 = yield myContractInstance.methods.reserve0().call();
                }
                catch (e) { }
                try {
                    result.reserve1 = yield myContractInstance.methods.reserve1().call();
                }
                catch (e) { }
                try {
                    result.factory = yield myContractInstance.methods.factory().call();
                }
                catch (e) { }
                try {
                    result.totalSupply = yield myContractInstance.methods.totalSupply().call();
                }
                catch (e) { }
                this.shape = result;
                return this;
            }
            catch (err) {
                this.shape = result;
                return this;
            }
        });
    }
    static all(db, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            let q = "SELECT * FROM pairs ";
            if (limit)
                q += `ORDER BY created_at ASC LIMIT ${limit}`;
            let r = yield db.query(q);
            if (r === null)
                return [];
            let f = [];
            for (let x of r)
                f.push(new Pair({
                    id: x['id'],
                    name: x['name'],
                    address: x['address'],
                    created_at: x['created_at'],
                    network_id: x['network_id'],
                    symbol: x['symbol'],
                    token0: x['token0'],
                    token1: x['token1'],
                    reserve0: x['reserve0'],
                    reserve1: x['reserve1'],
                    factory: x['factory'],
                    totalSupply: x['totalSupply']
                }));
            return f;
        });
    }
    tvl({ safe, router }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (safe.w3 === undefined)
                throw new Error('[PAIR] SafeWeb3 Down.');
            if (!this.shape.token0 || !this.shape.token1)
                throw new Error('[PAIR] Cannot getPrice on a not resolved Pair.');
            try {
                let pair_contract = new (safe.w3).eth.Contract(Pair.ABI, this.shape.address);
                let _tvl = 0;
                const token0 = new safe.w3.eth.Contract(_1.Token.ABI, this.shape.token0);
                const token1 = new safe.w3.eth.Contract(_1.Token.ABI, this.shape.token1);
                const t0_decimals = Number(yield token0.methods.decimals().call());
                const t1_decimals = Number(yield token1.methods.decimals().call());
                const reserves = yield pair_contract.methods.getReserves().call();
                const reserve0 = reserves[0];
                const reserve1 = reserves[1];
                const t1_t0_price = yield (0, utils_1.getPrice)({ w3: safe.w3, router_address: router, path: [this.shape.token1, this.shape.token0] });
                let t0_usdc_price = 1;
                if (this.shape.token0.toLowerCase() !== safe.network.common["USDC"].toLowerCase())
                    t0_usdc_price = yield (0, utils_1.getPrice)({ w3: safe.w3, router_address: router, path: [this.shape.token0, safe.network.common["USDC"]] });
                const t1_usdc_price = t1_t0_price * t0_usdc_price;
                const t0_vl = new bignumber_js_1.BigNumber(reserve0).shiftedBy(-1 * t0_decimals).toNumber() * t0_usdc_price;
                const t1_vl = new bignumber_js_1.BigNumber(reserve1).shiftedBy(-1 * t1_decimals).toNumber() * t1_usdc_price;
                _tvl += (t0_vl + t1_vl);
                return _tvl;
            }
            catch (err) {
                throw new Error(`${utils_1.Colors.RED}[PAIR] tvl(): ${err} ${utils_1.Colors.RESET}`);
            }
        });
    }
    getPrice(safe, router) {
        return __awaiter(this, void 0, void 0, function* () {
            if (safe.w3 === undefined)
                throw new Error('[PAIR] SafeWeb3 Down.');
            try {
                const pair_contract = new (safe.w3).eth.Contract(Pair.ABI, this.shape.address);
                const pair_decimals = Number(yield pair_contract.methods.decimals().call());
                const tvl = yield this.tvl({ safe: safe, router: router });
                const supply = new bignumber_js_1.BigNumber(yield pair_contract.methods.totalSupply().call()).shiftedBy(-1 * pair_decimals).toNumber();
                const price = (tvl / supply);
                return price;
            }
            catch (err) {
                throw new Error(`${utils_1.Colors.RED}[PAIR] getPrice(): ${err} ${utils_1.Colors.RESET}`);
            }
        });
    }
    token0(db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.shape.token0)
                return undefined;
            let t0 = yield _1.Token.get(db, `address="${this.shape.token0}"`);
            return t0 !== null
                ? t0
                : new _1.Token({
                    address: this.shape.token0,
                    network_id: this.shape.network_id,
                    created_at: new Date()
                });
        });
    }
    token1(db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.shape.token1)
                return undefined;
            let t1 = yield _1.Token.get(db, `address="${this.shape.token1}"`);
            return t1 !== null
                ? t1
                : new _1.Token({
                    address: this.shape.token1,
                    network_id: this.shape.network_id,
                    created_at: new Date()
                });
        });
    }
    filter(safe) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let filter = new ContractFilter_1.ContractFilter(safe);
            filter.setRules([Pair.filterRules]);
            let opcode = yield ((_a = safe.w3) === null || _a === void 0 ? void 0 : _a.eth.getCode(this.shape.address));
            if (opcode === undefined)
                return null;
            let entity_name = yield filter.load({
                code: opcode,
                address: this.shape.address
            }).filter();
            if (entity_name === "Pair")
                return this;
            else
                return null;
        });
    }
    updateTvl({ safe, router, db }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let tvl = yield this.tvl({ safe, router });
                let q = db.f(`INSERT IGNORE INTO pairs_tvl (address, tvl, created_at) VALUES (?,?,?)`, [this.shape.address, tvl, new Date()]);
                yield db.query(q);
                return tvl;
            }
            catch (err) {
                console.log(`${utils_1.Colors.RED}[PAIR] updateTvl(): ${err}${utils_1.Colors.RESET}`);
                return 0;
            }
        });
    }
}
exports.Pair = Pair;
Pair.ABI = require('../../abis/pair.json').abi;
Pair.uid = 'Pair';
Pair.filterRules = {
    rule: 'factory()',
    for: Pair.uid,
    next: {
        rule: 'MINIMUM_LIQUIDITY()',
        for: Pair.uid,
        next: {
            rule: 'token0()',
            for: Pair.uid,
            next: {
                rule: 'token1()',
                for: Pair.uid,
                next: {
                    rule: 'getReserves()',
                    for: Pair.uid
                }
            }
        }
    }
};
//# sourceMappingURL=Pair.js.map