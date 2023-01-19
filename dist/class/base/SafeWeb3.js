"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeWeb3 = void 0;
const web3_1 = __importDefault(require("web3"));
const utils_1 = require("../utils");
class SafeWeb3 {
    constructor({ network, secret }) {
        this.load = () => {
            try {
                this.wsprovider = new web3_1.default.providers.WebsocketProvider(this.network.wss[0], this.options);
                this.web3 = new web3_1.default(this.wsprovider);
                this.web3.eth.handleRevert = true;
                if (this.secret != undefined)
                    this.admin_account = this.web3.eth.accounts.wallet.add(this.secret).address;
                console.log(`${utils_1.Colors.CYAN}[SAFEWEB3] Data from ${this.network.wss[this.last_provider_id]}.${utils_1.Colors.RESET}`);
                return true;
            }
            catch (err) {
                console.log(`${utils_1.Colors.RED}[SAFEWEB3] Cannot Instanciate SafeWeb3: ${err}${utils_1.Colors.RESET}`);
                return false;
            }
        };
        this.reload = (persistent = true) => {
            try {
                let p = this.changeProvider();
                console.log(`${utils_1.Colors.YELLOW}[SAFEWEB3] Connection attempt #${++this.reload_attempt} with ${p}${utils_1.Colors.RESET}`);
            }
            catch (err) {
                console.log(`${utils_1.Colors.RED}[SAFEWEB3] Failed to connect to ${this.network.wss[this.last_provider_id]}${utils_1.Colors.RESET}`);
                if (!persistent) {
                    console.log(`${utils_1.Colors.RED}[SAFEWEB3] Cannot Instanciate Web3. Exit.${utils_1.Colors.RESET}`);
                    process.exit();
                }
                setTimeout(this.reload, SafeWeb3.TIMEOUT);
            }
        };
        this.changeProvider = () => {
            let p = this.network.wss[++this.last_provider_id % this.network.wss.length];
            this.wsprovider = new web3_1.default.providers.WebsocketProvider(p, this.options);
            if (this.web3)
                this.web3.setProvider(this.wsprovider);
            else
                this.load();
            return p;
        };
        this.admin = () => {
            return this.admin_account;
        };
        this.options = {
            timeout: SafeWeb3.TIMEOUT,
            clientConfig: {
                maxReceivedFrameSize: 100000000,
                maxReceivedMessageSize: 100000000,
                keepalive: true,
                keepaliveInterval: -1
            },
            reconnect: {
                auto: true,
                delay: 1000,
                maxAttempts: 8,
                onTimeout: false
            }
        };
        this.last_provider_id = 0;
        this.reload_attempt = 0;
        this.network = network;
        this.secret = secret !== null && secret !== void 0 ? secret : undefined;
        this.admin_account = undefined;
        this.wsprovider = null;
    }
    get currentProvider() {
        return this.network.wss[this.last_provider_id];
    }
    get w3() {
        return this.web3;
    }
}
exports.SafeWeb3 = SafeWeb3;
SafeWeb3.TIMEOUT = 10 * 1000;
SafeWeb3.RELOAD = true;
SafeWeb3.DOWNERROR = `${utils_1.Colors.RED}[SAFEWEB3] Down.${utils_1.Colors.RESET}`;
//# sourceMappingURL=SafeWeb3.js.map