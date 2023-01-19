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
exports.App = void 0;
const _1 = require("./");
const entities_1 = require("../entities");
const models_1 = require("../models");
const utils_1 = require("../utils");
class App {
    constructor({ config, scanHandler }) {
        this.eventsMap = {};
        this.config = config;
        this.network = this.getNetwork();
        this.db = new _1.Database(config.db, true);
        this.safe = new _1.SafeWeb3({
            network: this.network
        });
        if (!this.safe.load())
            throw new Error(_1.SafeWeb3.DOWNERROR);
        this.scanner = new _1.Scanner({
            safe: this.safe,
            db: this.db,
            network: this.network,
            log: this.config.log,
            filterRules: [
                entities_1.MasterChef.filterRules,
                entities_1.Pair.filterRules,
                entities_1.Token.filterRules
            ],
            fnScan: scanHandler
        });
        this.clock = new _1.Clock();
    }
    getNetwork() {
        let net = this.config.networks.find(el => el.name == this.config.network);
        if (net === undefined)
            net = this.config.networks[0];
        return new models_1.Network(net);
    }
    loadEvents(map) {
        this.eventsMap = map;
    }
    handleEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.eventsMap == {})
                return;
            for (let e in this.eventsMap) {
                switch (e) {
                    case 'Factory':
                        models_1.Factory.all(this.db).then((collection) => __awaiter(this, void 0, void 0, function* () {
                            if (collection.length == 0)
                                return;
                            collection.map((f) => __awaiter(this, void 0, void 0, function* () {
                                if (f === null)
                                    process.exit();
                                let E = this.eventsMap[f.constructor.name];
                                try {
                                    new _1.Listener(f.name, this.safe, f.constructor.name, { abi: E.abi, address: f.address })
                                        .listenTo(E.events);
                                }
                                catch (err) {
                                    console.log(`${utils_1.Colors.RED}[LISTENER][${f.constructor.name}] ${err}${utils_1.Colors.RESET}`);
                                }
                            }));
                        }));
                        break;
                    case 'MasterChef':
                        entities_1.MasterChef.all(this.db).then((collection) => __awaiter(this, void 0, void 0, function* () {
                            collection.map((m, i) => __awaiter(this, void 0, void 0, function* () {
                                var _a;
                                if (m === null)
                                    process.exit();
                                let E = this.eventsMap[m.constructor.name];
                                try {
                                    new _1.Listener([entities_1.MasterChef.uid, (_a = m.shape.name) !== null && _a !== void 0 ? _a : i].join(" "), this.safe, m.constructor.name, { abi: E.abi, address: m.shape.address })
                                        .listenTo(E.events);
                                }
                                catch (err) {
                                    console.log(`${utils_1.Colors.RED}[LISTENER][${m.constructor.name}] ${err}${utils_1.Colors.RESET}`);
                                }
                            }));
                        }));
                        break;
                }
            }
        });
    }
    addClockMethod({ name, fn, thick }) {
        if (!this.clock.get(name)) {
            this.clock.addTimer(name, fn, thick);
            return true;
        }
        return false;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.db.connect().then(() => {
                this.handleEvents();
                this.clock.init();
                this.scanner.init();
            });
        });
    }
}
exports.App = App;
//# sourceMappingURL=App.js.map