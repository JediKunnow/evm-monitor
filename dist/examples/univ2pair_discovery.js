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
const utils_1 = require("../class/utils");
const config = require('../config/config.js').config;
const app = new base_1.App({
    config: config,
    scanHandler: (scanner, receipt) => __awaiter(void 0, void 0, void 0, function* () { })
});
app.loadEvents({
    'Pair': {
        abi: require('./abis/pair.json').abi,
        events: [
            {
                event: 'Swap',
                handler: (l, e) => {
                    console.log(`${utils_1.Colors.MAGENTA}[PAIR=${l.contractInfo.address}] Swap detected! ${JSON.stringify(e.returnValues)}${utils_1.Colors.RESET}`);
                }
            },
            {
                event: 'Transfer'
            },
            { event: 'Sync' },
            { event: 'Burn' }
        ]
    },
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
    }
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
//# sourceMappingURL=univ2pair_discovery.js.map