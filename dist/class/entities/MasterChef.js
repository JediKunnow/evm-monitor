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
exports.MasterChef = void 0;
const base_1 = require("../base");
const shapes_1 = require("../shapes");
const _1 = require(".");
const bignumber_js_1 = require("bignumber.js");
const utils_1 = require("../utils");
class MasterChef extends base_1.Entity {
    constructor(params) {
        super({
            shape: new shapes_1.MasterChefShape(params),
            abi: MasterChef.ABI,
            required: ['id', 'network_id', 'created_at'],
            table: MasterChef.table
        });
        this.shape = params;
        this.balances = [];
    }
    get should_save() {
        return true;
    }
    resolve(safe) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = new shapes_1.MasterChefShape(this.shape);
            if (safe.w3 === undefined)
                throw new Error("Resolve failed due an invalid instance of Web3 Provided.");
            try {
                var myContractInstance = new safe.w3.eth.Contract(this.abi, this.shape.address);
                try {
                    result.length = yield myContractInstance.methods.poolLength().call();
                }
                catch (e) { }
                try {
                    result.start = yield myContractInstance.methods.startBlock().call();
                }
                catch (e) { }
                try {
                    result.owner = yield myContractInstance.methods.owner().call();
                }
                catch (e) { }
                return this;
            }
            catch (err) {
                console.log(err);
                return this;
            }
        });
    }
    static all(db) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = yield db.query(`SELECT * from masterchefs`);
            if (r === null)
                return [];
            let f = [];
            for (let x of r)
                f.push(new MasterChef({
                    id: x['id'],
                    name: x['name'],
                    address: x['address'],
                    created_at: x['created_at'],
                    network_id: x['network_id'],
                    length: x['length'],
                    start: x['start'],
                    owner: x['owner'],
                    verified: x['verified']
                }));
            return f;
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
            return new MasterChef({
                id: x['id'],
                network_id: x['network_id'],
                address: x['address'],
                name: x['name'],
                owner: x['owner'],
                created_at: x['created_at'],
                verified: x['verified'],
                length: x['length'],
                start: x['start']
            });
        });
    }
    markAsVerified(db) {
        return __awaiter(this, void 0, void 0, function* () {
            this.shape.verified = true;
            this.save(db);
        });
    }
    getPairs(safe) {
        return __awaiter(this, void 0, void 0, function* () {
            if (safe.w3 === undefined)
                throw new Error('[MASTERCHEF] SafeWeb3 down.');
            try {
                let pools = [];
                let contract = new (safe.w3.eth).Contract(this.abi, this.shape.address);
                let len = yield contract.methods.poolLength().call();
                for (let i = 0; i < len; i++) {
                    let pool_info = yield contract.methods.poolInfo(i).call();
                    pools.push(new _1.Pair({
                        address: pool_info[0],
                        network_id: safe.network.db_id,
                        created_at: new Date()
                    }));
                }
                return pools;
            }
            catch (err) {
                console.log(`${utils_1.Colors.RED}[MASTERCHEF] getPairs(): ${err} ${utils_1.Colors.RESET}`);
                return [];
            }
        });
    }
    tvl({ safe, router }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!safe.w3)
                throw new Error('[MASTERCHEF] SafeWeb3 Down.');
            const pairs = yield this.getPairs(safe);
            let total_value_locked = 0;
            for (let p of pairs) {
                const pair_contract = new safe.w3.eth.Contract(_1.Pair.ABI, p.shape.address);
                const pair_decimals = Number(yield pair_contract.methods.decimals().call());
                let mc_pair_balance;
                let mc_pair_balance_bn = new bignumber_js_1.BigNumber(yield pair_contract.methods.balanceOf(this.shape.address).call());
                mc_pair_balance = mc_pair_balance_bn.shiftedBy(-1 * pair_decimals).toNumber();
                try {
                    let _tvl = 0;
                    let resolved;
                    let processed = false;
                    const pairObj = yield p.filter(safe);
                    if (pairObj) {
                        resolved = yield pairObj.resolve(safe);
                        if (resolved.shape.token0 && resolved.shape.token1) {
                            let pair_price = yield resolved.getPrice(safe, router);
                            _tvl = (pair_price * mc_pair_balance);
                            processed = true;
                        }
                    }
                    if (!processed) {
                        if (p.shape.address.toLowerCase() !== safe.network.common["USDC"].toLowerCase()) {
                            let path = [p.shape.address];
                            if (p.shape.address.toLowerCase() !== safe.network.common["WMATIC"].toLowerCase())
                                path.push(safe.network.common["WMATIC"]);
                            path.push(safe.network.common["USDC"]);
                            let price = yield (0, utils_1.getPrice)({ w3: safe.w3, router_address: router, path: path });
                            _tvl = price * mc_pair_balance;
                        }
                        else {
                            _tvl = mc_pair_balance;
                        }
                    }
                    total_value_locked += _tvl;
                    this.balances.push({
                        address: p.shape.address,
                        amount: mc_pair_balance,
                        value: _tvl
                    });
                }
                catch (err) {
                    console.log(`${utils_1.Colors.RED}[MASTERCHEF] Cannot calc tvl: ${err}${utils_1.Colors.RESET}`);
                }
            }
            return total_value_locked;
        });
    }
    tvlHistory(db) {
        return __awaiter(this, void 0, void 0, function* () {
            let q = db.f(`SELECT tvl FROM masterchefs_tvl WHERE address=?`, [this.shape.address]);
            let r = yield db.query(q);
            if (r === null)
                return [];
            return r;
        });
    }
    updateTvl({ safe, router, db }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let tvl = yield this.tvl({ safe, router });
                let q = db.f(`INSERT IGNORE INTO masterchefs_tvl (address, tvl, created_at) VALUES (?,?,?)`, [this.shape.address, tvl, new Date()]);
                let r = yield db.query(q);
                return r !== null;
            }
            catch (err) {
                console.log(`${utils_1.Colors.RED}[MC] updateTvl(): ${err}${utils_1.Colors.RESET}`);
                return false;
            }
        });
    }
}
exports.MasterChef = MasterChef;
MasterChef.uid = "MasterChef";
MasterChef.ABI = require('../../abis/masterchef.json');
MasterChef.filterRules = {
    rule: 'poolLength()',
    for: MasterChef.uid,
    next: {
        rule: 'poolInfo()',
        for: MasterChef.uid,
        next: {
            rule: 'deposit()',
            for: MasterChef.uid,
            next: {
                rule: 'withdraw()',
                for: MasterChef.uid,
                next: {
                    rule: 'startBlock()',
                    for: MasterChef.uid,
                    next: {
                        rule: 'canHarvest()',
                        for: MasterChef.uid,
                    }
                }
            }
        }
    }
};
MasterChef.table = "masterchefs";
//# sourceMappingURL=MasterChef.js.map