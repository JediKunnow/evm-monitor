import { App, Listener, ListenerMonitor, Scanner } from '../class/base';
import { Pair} from '../class/entities';
import { IConfig } from "../interfaces/IConfig";
import { Colors, Timings } from '../class/utils';
import { TransactionReceipt } from 'web3-eth';

const config :IConfig = require('../config/config.js').config;

/* Main Instance of evm-monitor */
const app = new App({
    config: config,
    scanHandler: async (scanner: Scanner, receipt: TransactionReceipt) => {}
});

/*
    Load eventsMap, it contains all the events you want to listen to, with the relative handler functions. 
    All the events configuration is done through the eventsMap ( see App.eventsMap for more details about its structure).
    The purpose of this structure is to map events to entities and handle them indipendently.
*/
app.loadEvents({
    'Pair': {
        abi: require('./abis/pair.json').abi,
        events: [
            {
                event: 'Swap',
                handler: (l: Listener, e: any) => {
                    console.log(`${Colors.MAGENTA}[PAIR=${l.contractInfo.address}] Swap detected! ${JSON.stringify(e.returnValues)}${Colors.RESET}`);
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
                handler: (l: Listener, e: any) => {
                    new Pair({address: e.returnValues.pair, network_id: app.network.db_id, created_at: new Date()})
                    .resolve(app.safe)
                    .then((p: Pair) => {
                        p.create(app.db)
                        .then(pairId => {
                            p.updateTvl({
                                safe: app.safe,
                                router: app.network.routers["quick"],
                                db: app.db
                            }).then((tvl: number) => {
                                console.log(`${Colors.MAGENTA}[PAIR] ${p.shape.token0}/${p.shape.token1} deployed on ${p.shape.factory} and stored with id=${pairId} and TVL=${tvl}$ ${Colors.RESET}`);
                            });

                            /*
                                Token.get(app.db,`address="${e.returnValues.token0}" OR address="${e.returnValues.token1}"`)
                                .then( token => {
                                    if(token !== null){
                                        console.log(`${Colors.MAGENTA}[PAIR] ${e.returnValues.pair} disovered for token ${token.id} and stored with id=${pairId}`);
                                        token.markAsSelected(app.db)
                                        .then(t => {
                                            console.log(`${Colors.MAGENTA}[TOKEN] ${t.id} marked.`);
                                        });
                                    }else{
                                        if(!l.safe.w3) return;
                                        let web3 = l.safe.w3;
                                        if(p.shape.factory){
                                            new web3.eth.Contract(Token.ABI, p.shape.token0).methods.symbol().call()
                                                .then((s0: string) => {
                                                    new web3.eth.Contract(Token.ABI, p.shape.token1).methods.symbol().call()
                                                    .then((s1: string) => {
                                                        console.log(`${Colors.MAGENTA}[PAIR] ${s0}/${s1} deployed on ${p.shape.factory} and stored with id=${pairId}${Colors.RESET}`);
                                                    });
                                                });
                                            Factory.get(app.db,p.shape.factory)
                                            .then((factory) => {
                                                let factoryName = (factory) ? factory.name : p.shape.factory;
                                                new web3.eth.Contract(Token.ABI, p.shape.token0).methods.symbol().call()
                                                .then((s0: string) => {
                                                    new web3.eth.Contract(Token.ABI, p.shape.token1).methods.symbol().call()
                                                    .then((s1: string) => {
                                                        console.log(`${Colors.MAGENTA}[PAIR] ${s0}/${s1} deployed on ${factoryName} and stored with id=${pairId}${Colors.RESET}`);
                                                    });
                                                });
                                            });
                                        }
                                    }
                                });
                            */
                            
                        });
                    });
                }
            }
        ]
    }
});

/* 
    Clock Methods are scheduled tasks, they are fired by the App Clock every x milliseconds.
    You can run as many clock methods you need, but always considering your computer resources...
    A clock method is represented as below:
    {
        name: string,
        fn: async (): Promise<void>,
        thick: number
    }
    where 
    name: is an alias for logging
    fn: is the handler function
    thick: is the delay expressed in milliseconds
*/

// Process Monitor
app.addClockMethod({
    name: 'Process_Monitor',
    fn: async (): Promise<void> => {
        for(let x of ListenerMonitor.listeners()){
            if(!ListenerMonitor.running(x)){
                console.log(`${Colors.YELLOW}[MONITOR][LISTENER][${x.name}] Restarting...${Colors.RESET}`);
                x.listenTo(app.eventsMap[x.for].events);
            }
        }
    },
    thick: Timings.s(10)
});

/* Pair Tvl Monitor */
app.addClockMethod({
    name: 'Pair_Tvl_Monitor',
    fn: async (): Promise<void> => {
        Pair.all(app.db, 50).then( (collection: Pair[]) => {
            collection.map( (p) => {
                if(app.safe.w3 !== undefined){
                    if(p.shape.token0 && p.shape.token1){
                        p.updateTvl({
                            safe: app.safe,
                            router: app.network.routers["quick"],
                            db: app.db
                        }).catch((err) => {
                            console.log(`${Colors.RED}[Pair_Tvl_Monitor] Error: ${err}${Colors.RESET}`);
                        });
                    }
                }
            });
        }).catch(err => {
            console.log(`${Colors.RED}[Pair_Tvl_Monitor] Error: ${err}${Colors.RESET}`);
        });
    },
    thick: Timings.m(30)
});

app.run().catch( (err) => {
    console.log(err);
});
