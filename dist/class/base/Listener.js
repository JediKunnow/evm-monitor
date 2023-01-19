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
exports.Listener = void 0;
const _1 = require("./");
const utils_1 = require("../utils");
class Listener {
    constructor(name, safe, for_model, { abi, address }) {
        if (safe.w3 === undefined)
            throw new Error('Load SafeWeb3 before to instanciate a Listener.');
        this.name = name;
        this.for = for_model;
        this.safe = safe;
        this.contractInfo = {
            abi: abi,
            address: address
        };
    }
    listenTo(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`${utils_1.Colors.BRIGHT_BLUE}[LISTENER][${this.name.toUpperCase()}] on ${data.map(o => o.event).join(", ")}${utils_1.Colors.RESET}`);
            _1.ListenerMonitor.run(this);
            try {
                if (!this.safe.w3) {
                    _1.ListenerMonitor.error(this);
                    return;
                }
                this.contract = new this.safe.w3.eth.Contract(this.contractInfo.abi, this.contractInfo.address);
                this.contract.events.allEvents({ fromBlock: 0 })
                    .on('data', (e) => {
                    for (let d of data) {
                        if (d.event == e.event) {
                            if (d.handler)
                                d.handler(this, e);
                            else
                                console.log(`${utils_1.Colors.MAGENTA}[EVENT][${this.name}] ${e.event}: ${Object.keys(e.returnValues).filter(k => k.length > 1).map(k => { if (k.length > 1)
                                    return `${k}: ${e.returnValues[k]}`; }).join(", ")}${utils_1.Colors.RESET}`);
                        }
                    }
                }).on('error', (err) => __awaiter(this, void 0, void 0, function* () {
                    _1.ListenerMonitor.error(this);
                    return;
                }));
            }
            catch (err) {
                console.log(`${utils_1.Colors.RED}[LISTENER][${this.name}] Exit.${utils_1.Colors.RESET}`);
                _1.ListenerMonitor.error(this);
            }
        });
    }
}
exports.Listener = Listener;
//# sourceMappingURL=Listener.js.map