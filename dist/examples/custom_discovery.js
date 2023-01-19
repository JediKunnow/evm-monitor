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
const base_1 = require("../class/base");
const entities_1 = require("../class/entities");
const models_1 = require("../class/models");
const utils_1 = require("../class/utils");
const runners_1 = require("../class/runners");
const config = require('../config/config.js').config;
const fnScan = (scanner, receipt) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let contractAddress = (receipt.contractAddress !== undefined) ? receipt.contractAddress : "";
    if (contractAddress.length > 0) {
        if (!scanner.safe.w3)
            throw new Error("SafeWeb3 down.");
        (_a = scanner.safe.w3) === null || _a === void 0 ? void 0 : _a.eth.getCode(contractAddress).then((opcode) => {
            if (opcode != '0x0') {
                scanner.filter.load({ code: opcode, address: contractAddress }).filter().then((entity_name) => {
                    if (entity_name === null)
                        return;
                    base_1.EntityFactory.issue(entity_name, {
                        address: contractAddress,
                        network_id: scanner.network.db_id,
                        created_at: new Date()
                    })
                        .resolve(scanner.safe)
                        .then((e) => {
                        e.create(scanner.dbengine)
                            .then((id) => {
                            if (id) {
                                if (e instanceof entities_1.Pair) {
                                    models_1.Factory.get(scanner.dbengine, e.shape.address)
                                        .then((f) => {
                                        if (f == null)
                                            return;
                                        e.shape.factory = f.id.toString();
                                        e.save(scanner.dbengine).then(() => {
                                            console.log(`Pair factory resolved: ${f.name} [${e.shape.factory}]`);
                                        });
                                    });
                                }
                                console.log(`${utils_1.Colors.BRIGHT_GREEN}[FILTER] ${entity_name} @${receipt.contractAddress} {${id}}${utils_1.Colors.RESET}`);
                            }
                        });
                    }).catch((err) => {
                        console.log(`${utils_1.Colors.RED}${entity_name}[RESOLVE] ${err} ${utils_1.Colors.RESET}`);
                    });
                });
            }
        }).catch((err) => {
            if (scanner.LOG)
                console.log(`${utils_1.Colors.RED}[FNSCAN] ${err} ${utils_1.Colors.RESET}`);
        });
    }
});
const app = new base_1.App({
    config: config,
    scanHandler: fnScan
});
app.loadEvents({
    'Factory': {
        abi: require('./abis/Factory.json'),
        events: [
            {
                event: 'PairCreated',
                handler: (l, e) => {
                    new entities_1.Pair({ address: e.returnValues.pair, network_id: app.network.db_id, created_at: new Date() })
                        .resolve(app.safe)
                        .then((p) => {
                        p.create(app.db)
                            .then(pairId => {
                            p.updateTvl({
                                safe: app.safe,
                                router: app.network.routers["quick"],
                                db: app.db
                            }).then((tvl) => {
                                console.log(`${utils_1.Colors.MAGENTA}[PAIR] ${p.shape.token0}/${p.shape.token1} deployed on ${p.shape.factory} and stored with id=${pairId} and TVL=${tvl}$ ${utils_1.Colors.RESET}`);
                            });
                        });
                    });
                }
            }
        ]
    },
});
app.addClockMethod({
    name: 'Process_Monitor',
    fn: () => __awaiter(void 0, void 0, void 0, function* () {
        for (let x of base_1.ListenerMonitor.listeners()) {
            if (!base_1.ListenerMonitor.running(x)) {
                console.log(`${utils_1.Colors.YELLOW}[MONITOR][LISTENER][${x.name}] Restarting...${utils_1.Colors.RESET}`);
                x.listenTo(app.eventsMap[x.for].events);
            }
        }
    }),
    thick: utils_1.Timings.s(10)
});
app.addClockMethod({
    name: 'MasterChef_Validator',
    fn: () => __awaiter(void 0, void 0, void 0, function* () {
        entities_1.MasterChef.all(app.db).then((collection) => {
            collection.map((mc) => {
                new runners_1.MasterChefRunner({
                    sub: mc,
                    db: app.db,
                    network: app.network
                }).run();
            });
        });
    }),
    thick: utils_1.Timings.m(10)
});
app.addClockMethod({
    name: 'MasterChef_PoolLenght_Monitor',
    fn: () => __awaiter(void 0, void 0, void 0, function* () {
        entities_1.MasterChef.all(app.db).then((collection) => {
            collection.map((mc) => {
                if (app.safe.w3 !== undefined) {
                    let c = new (app.safe.w3).eth.Contract(entities_1.MasterChef.ABI, mc.shape.address);
                    c.methods.poolLength().call().then((len) => {
                        mc.shape.length = len;
                        mc.save(app.db);
                    }).catch((err) => {
                        console.log(`${utils_1.Colors.RED}[MasterChef_PoolLenght_Monitor] Error: ${err}${utils_1.Colors.RESET}`);
                    });
                    ;
                    ;
                }
            });
        });
    }),
    thick: utils_1.Timings.h(1)
});
app.addClockMethod({
    name: 'MasterChef_Tvl_Monitor',
    fn: () => __awaiter(void 0, void 0, void 0, function* () {
        entities_1.MasterChef.all(app.db).then((collection) => {
            collection.map((mc) => {
                if (app.safe.w3 !== undefined) {
                    if (mc.shape.length && mc.shape.length > 0 && mc.shape.verified) {
                        mc.updateTvl({
                            safe: app.safe,
                            router: app.network.routers["quick"],
                            db: app.db
                        }).catch((err) => {
                            console.log(`${utils_1.Colors.RED}[MasterChef_Tvl_Monitor] Error: ${err}${utils_1.Colors.RESET}`);
                        });
                    }
                }
            });
        }).catch(err => {
            console.log(`${utils_1.Colors.RED}[MasterChef_Tvl_Monitor] Error: ${err}${utils_1.Colors.RESET}`);
        });
    }),
    thick: utils_1.Timings.h(1)
});
app.addClockMethod({
    name: 'Pair_Tvl_Monitor',
    fn: () => __awaiter(void 0, void 0, void 0, function* () {
        entities_1.Pair.all(app.db, 50).then((collection) => {
            collection.map((p) => {
                if (app.safe.w3 !== undefined) {
                    if (p.shape.token0 && p.shape.token1) {
                        p.updateTvl({
                            safe: app.safe,
                            router: app.network.routers["quick"],
                            db: app.db
                        }).catch((err) => {
                            console.log(`${utils_1.Colors.RED}[Pair_Tvl_Monitor] Error: ${err}${utils_1.Colors.RESET}`);
                        });
                    }
                }
            });
        }).catch(err => {
            console.log(`${utils_1.Colors.RED}[Pair_Tvl_Monitor] Error: ${err}${utils_1.Colors.RESET}`);
        });
    }),
    thick: utils_1.Timings.m(30)
});
app.run().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=custom_discovery.js.map