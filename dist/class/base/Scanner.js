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
exports.Scanner = void 0;
const base_1 = require("../base");
const utils_1 = require("../utils");
class BlockInfo {
    constructor(block) {
        this.number = block.number;
        this.transactions = block.transactions;
        this.is_processed = false;
    }
    processed() {
        return this.is_processed;
    }
    process() {
        this.is_processed = true;
    }
}
class Scanner {
    constructor({ safe, db, network, log, filterRules, fnScan }) {
        this.__process_block = (blockInfo) => __awaiter(this, void 0, void 0, function* () {
            if (blockInfo.number > 0) {
                this.__digest_transactions(blockInfo).then(() => {
                    blockInfo.process();
                });
            }
            return blockInfo.transactions.length;
        });
        this.__digest_transactions = (blockInfo) => __awaiter(this, void 0, void 0, function* () {
            let i = 0;
            blockInfo.transactions.forEach((tx_address) => {
                i++;
                this.__digest_transaction(tx_address).catch(err => {
                    console.log("Cannot digest transactions of #" + tx_address + " --- " + err);
                });
                if (i == blockInfo.transactions.length && this.LOG)
                    process.stdout.write("\t[" + i + "]");
            });
            return blockInfo.transactions.length;
        });
        this.__digest_transaction = (tx_address) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (typeof (tx_address) !== 'string')
                return;
            (_a = this.safe.w3) === null || _a === void 0 ? void 0 : _a.eth.getTransaction(tx_address).then((tx) => {
                var _a;
                if (tx == null || tx.to != null)
                    return;
                (_a = this.safe.w3) === null || _a === void 0 ? void 0 : _a.eth.getTransactionReceipt(tx_address).then((receipt) => {
                    if (!receipt)
                        return;
                    if (this.fnScan)
                        this.fnScan(this, receipt);
                });
            }).catch((err) => {
                throw err;
            });
        });
        this.init = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.safe.w3)
                throw new Error(base_1.SafeWeb3.DOWNERROR);
            this.safe.w3.eth.subscribe('newBlockHeaders', (error, result) => {
                if (!error)
                    return;
                console.log(`${utils_1.Colors.RED}[SUBSCRIPTION]${error}${utils_1.Colors.RESET}`);
            })
                .on("connected", subscriptionId => {
                console.log(`${utils_1.Colors.BRIGHT_BLUE}[SCANNER] You are connected on ${this.safe.currentProvider} @${subscriptionId}.${utils_1.Colors.RESET}`);
                console.log(`${utils_1.Colors.BRIGHT_BLUE}[SCANNER] Running.${utils_1.Colors.RESET}`);
            })
                .on('data', block => {
                if (this.start_block == 0)
                    this.start_block = block.number;
                if (!this.safe.w3)
                    throw new Error(base_1.SafeWeb3.DOWNERROR);
                this.safe.w3.eth.getBlock(block.number).then(_block => {
                    if (_block) {
                        if (this.LOG)
                            process.stdout.write(`\n[${block.number}] Fetching...`);
                        if (_block.transactions.length > 0) {
                            var blInfo = new BlockInfo(_block);
                            this.__process_block(blInfo).then((txs) => {
                                if (this.LOG)
                                    process.stdout.write(`  ->  OK {${txs}} [${_block.number}] [${new Date().toLocaleTimeString()}]\n`);
                            }).catch(err => console.log(err));
                        }
                        else {
                            if (this.LOG)
                                process.stdout.write(`  ->  SKIP [${block.number}]\n`);
                        }
                    }
                }).catch(err => {
                    process.stdout.write(`${err} -> KO\n`);
                });
            })
                .on('error', (error) => __awaiter(this, void 0, void 0, function* () {
                console.log(`${utils_1.Colors.RED}[SCANNER] Web3 not available.${utils_1.Colors.RESET}`);
                if (base_1.SafeWeb3.RELOAD)
                    this.safe.reload();
                if (this.fnScan === undefined) {
                    console.log(`${utils_1.Colors.RED}[SCANNER] Exit.${utils_1.Colors.RESET}`);
                    process.exit();
                }
                this.init();
                console.log(`${utils_1.Colors.RED}[SCANNER] Restarted.${utils_1.Colors.RESET}`);
            }));
        });
        if (safe.w3 === undefined)
            throw new Error('Load SafeWeb3 before to instanciate a Scanner.');
        this.safe = safe;
        this.dbengine = db;
        this.network = network;
        this.LOG = log;
        this.start_block = 0;
        this.filter = new base_1.ContractFilter(safe);
        this.filter.setRules(filterRules);
        this.filter.print();
        this.fnScan = fnScan;
    }
}
exports.Scanner = Scanner;
Scanner.TIMEOUT = base_1.SafeWeb3.TIMEOUT + 1000;
Scanner.SCANNING = false;
//# sourceMappingURL=Scanner.js.map