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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timings = exports.Colors = exports.BlockExplorer = exports.getPairAddresOffChain = exports.getCostantProduct = exports.getPrice = exports.cleanString = exports.truncate = exports.has_method = exports.get_host_from_url = exports.strarraycompare = exports.strcompare = exports.editDistance = exports.delay = void 0;
const axios_1 = __importDefault(require("axios"));
const bignumber_js_1 = require("bignumber.js");
const config = require('../../config/config.js').config;
const delay = (ms) => new Promise(res => setTimeout(res, ms));
exports.delay = delay;
const editDistance = (s1, s2) => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
};
exports.editDistance = editDistance;
const strcompare = (s1, s2) => {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - (0, exports.editDistance)(longer, shorter)) / longerLength;
};
exports.strcompare = strcompare;
const strarraycompare = (s, A) => {
    var max = 0;
    var best = "";
    for (let i = 0; i < A.length - 1; i++) {
        let v = (0, exports.strcompare)(s, A[i]);
        if (v > max) {
            max = v;
            best = A[i];
        }
    }
    return [best, max];
};
exports.strarraycompare = strarraycompare;
const get_host_from_url = (url) => {
    try {
        return new URL(url).hostname;
    }
    catch (e) {
        return "";
    }
};
exports.get_host_from_url = get_host_from_url;
const has_method = (w3, code, signature) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = w3.eth.abi.encodeFunctionSignature(signature);
    return code.indexOf(hash.slice(2, hash.length)) > 0;
});
exports.has_method = has_method;
const truncate = (str, n) => {
    if (n == undefined)
        n = 32;
    return (str.length > n) ? str.substring(0, n - 1) : str;
};
exports.truncate = truncate;
const cleanString = (inp) => {
    if (inp == undefined)
        return "";
    if (typeof inp != "string")
        return inp;
    var input = (0, exports.truncate)(inp);
    var output = "";
    for (var i = 0; i < input.length; i++) {
        if (input.charCodeAt(i) <= 127) {
            output += input.charAt(i);
        }
    }
    return output;
};
exports.cleanString = cleanString;
const getPrice = ({ w3, router_address, path }) => __awaiter(void 0, void 0, void 0, function* () {
    if (path.length !== new Set(path).size)
        throw new Error(`[GETPRICE] Wrong path: ${path}`);
    const token_abi = [{
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "name": "",
                    "type": "uint8"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }];
    const router_abi = [{
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountIn",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "path",
                    "type": "address[]"
                }
            ],
            "name": "getAmountsOut",
            "outputs": [
                {
                    "internalType": "uint256[]",
                    "name": "amounts",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }];
    const router = new w3.eth.Contract(router_abi, router_address);
    const token_in = new w3.eth.Contract(token_abi, path[0]);
    const token_out = new w3.eth.Contract(token_abi, path[path.length - 1]);
    let tin_decimals = Number(yield token_in.methods.decimals().call());
    let tout_decimals = Number(yield token_out.methods.decimals().call());
    let base_amt = new bignumber_js_1.BigNumber(1).shiftedBy(tin_decimals);
    try {
        let amt = yield router.methods.getAmountsOut(base_amt, path).call();
        let p = new bignumber_js_1.BigNumber(amt[amt.length - 1]);
        return p.shiftedBy(-1 * tout_decimals).toNumber();
    }
    catch (err) {
        return 0;
    }
});
exports.getPrice = getPrice;
const getCostantProduct = ({ w3, pair }) => __awaiter(void 0, void 0, void 0, function* () {
    const token_abi = [{
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "name": "",
                    "type": "uint8"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }];
    const pair_abi = [{ "inputs": [], "name": "getReserves", "outputs": [{ "internalType": "uint112", "name": "_reserve0", "type": "uint112" }, { "internalType": "uint112", "name": "_reserve1", "type": "uint112" }, { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }], "stateMutability": "view", "type": "function" }];
    try {
        let pair_contract = new w3.eth.Contract(pair_abi, pair.p);
        const reserves = yield pair_contract.methods.getReserves().call();
        const token0 = new w3.eth.Contract(token_abi, pair.a);
        const token1 = new w3.eth.Contract(token_abi, pair.b);
        const t0_decimals = Number(yield token0.methods.decimals().call());
        const t1_decimals = Number(yield token1.methods.decimals().call());
        return new bignumber_js_1.BigNumber(reserves[0]).shiftedBy(-1 * t0_decimals).toNumber() * new bignumber_js_1.BigNumber(reserves[1]).shiftedBy(-1 * t1_decimals).toNumber();
    }
    catch (err) {
        console.log(err);
        return 0;
    }
});
exports.getCostantProduct = getCostantProduct;
const getPairAddresOffChain = (w3, factory_address, t0, t1) => {
    const strToHex = (str) => {
        var hex, i;
        var result = "";
        for (i = 0; i < str.length; i++) {
            hex = str.charCodeAt(i).toString(16);
            result += ("000" + hex).slice(-4);
        }
        return result;
    };
    let tokens = w3.utils.soliditySha3(t0, t1);
    if (!tokens)
        return "0x0000000000000000000000000000000000000000";
    let encoded_tokens = w3.utils.keccak256(tokens);
    let _packed_data = w3.utils.soliditySha3(strToHex('ff'), factory_address, encoded_tokens, strToHex('96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f'));
    if (!_packed_data)
        return "0x0000000000000000000000000000000000000000";
    return w3.utils.keccak256(_packed_data);
};
exports.getPairAddresOffChain = getPairAddresOffChain;
var BlockExplorer;
(function (BlockExplorer) {
    BlockExplorer.get_circulating_supply = (network, address) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://api.${network.name.toLowerCase()}scan.com/api?module=stats&action=tokenCsupply&contractaddress=${address}&apikey=${network.scan_api}`);
            return new bignumber_js_1.BigNumber(response.data.result).toNumber();
        }
        catch (error) {
            return -1;
        }
    });
    BlockExplorer.get_owner_balance = (network, address, owner) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://api.${network.name.toLowerCase()}scan.com/api?module=account&action=tokenbalance&contractaddress=${address}&address=${owner}&tag=latest&apikey=${network.scan_api}`);
            return new bignumber_js_1.BigNumber(response.data.result).toNumber();
        }
        catch (error) {
            console.log(error);
            return -1;
        }
    });
    BlockExplorer.is_contract_verified = (network, address) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://api.${network.name.toLowerCase()}scan.com/api?module=contract&action=getabi&address=${address}&apikey=${network.scan_api}`);
            return response.data['status'] == 1;
        }
        catch (error) {
            console.log(`${Colors.RED}[BLOCKEXPLORER] ${network.name.toUpperCase()} API EXPIRED${Colors.RESET}`);
            return false;
        }
    });
})(BlockExplorer = exports.BlockExplorer || (exports.BlockExplorer = {}));
class Colors {
    static bright(code) { return Colors.BRIGHT.concat(code); }
}
exports.Colors = Colors;
Colors.RESET = "\x1b[0m";
Colors.BRIGHT = "\x1b[1m";
Colors.DIM = "\x1b[2m";
Colors.UNDERSCORE = "\x1b[4m";
Colors.BLINK = "\x1b[5m";
Colors.REVERSE = "\x1b[7m";
Colors.HIDDEN = "\x1b[8m";
Colors.BLACK = "\x1b[30m";
Colors.RED = "\x1b[31m";
Colors.GREEN = "\x1b[32m";
Colors.YELLOW = "\x1b[33m";
Colors.BLUE = "\x1b[34m";
Colors.MAGENTA = "\x1b[35m";
Colors.CYAN = "\x1b[36m";
Colors.WHITE = "\x1b[37m";
Colors.BGBLACK = "\x1b[40m";
Colors.BGRED = "\x1b[41m";
Colors.BGGREEN = "\x1b[42m";
Colors.BGYELLOW = "\x1b[43m";
Colors.BGBLUE = "\x1b[44m";
Colors.BGMAGENTA = "\x1b[45m";
Colors.BGCYAN = "\x1b[46m";
Colors.BGWHITE = "\x1b[47m";
Colors.BRIGHT_RED = Colors.BRIGHT + Colors.RED;
Colors.BRIGHT_MAGENTA = Colors.BRIGHT + Colors.MAGENTA;
Colors.BRIGHT_YELLOW = Colors.BRIGHT + Colors.YELLOW;
Colors.BRIGHT_GREEN = Colors.BRIGHT + Colors.GREEN;
Colors.BRIGHT_BLUE = Colors.BRIGHT + Colors.BLUE;
Colors.BRIGHT_CYAN = Colors.BRIGHT + Colors.CYAN;
var Timings;
(function (Timings) {
    Timings.s = (n) => { return n * 1000; };
    Timings.m = (n) => { return n * 60 * 1000; };
    Timings.h = (n) => { return n * 60 * 60 * 1000; };
})(Timings = exports.Timings || (exports.Timings = {}));
//# sourceMappingURL=utils.js.map