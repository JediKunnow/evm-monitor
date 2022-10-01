import { App, EntityFactory, Listener, ListenerMonitor, Scanner, ScannerFunction } from './class/base';
import { FormalEntity, Pair, Token, MasterChef } from './class/entities';
import { IConfig } from "./interfaces/IConfig";
import { Factory } from './class/models';
import { UniqueID } from './class/shapes';
import { Colors, Timings } from './class/utils';
import { TransactionReceipt } from 'web3-eth';
import { MasterChefRunner } from './class/runners';

const config :IConfig = require('./config/config.js').config;

/* Scanner Function, it'll be executed on each tx ran by the chain */
const fnScan: ScannerFunction = async (scanner: Scanner, receipt: TransactionReceipt) :Promise<void> => {
    let contractAddress: string = (receipt.contractAddress !== undefined) ? receipt.contractAddress : "";
    if(contractAddress.length > 0){
        if(!scanner.safe.w3) throw new Error("SafeWeb3 down.");
        scanner.safe.w3?.eth.getCode(contractAddress).then( (opcode) => {
            if(opcode != '0x0'){
                scanner.filter.load({code: opcode, address: contractAddress}).filter().then( (entity_name: UniqueID | null) => {
                    if(entity_name === null) return;                 
                    EntityFactory.issue(entity_name, {
                        address: contractAddress,
                        network_id: scanner.network.db_id,
                        created_at: new Date()
                    })
                    .resolve(scanner.safe)
                    .then( (e: FormalEntity) => {
                        e.create(scanner.dbengine)
                            .then( (id) => {
                                if(id){
                                    if(e instanceof Pair){
                                        Factory.get(scanner.dbengine, e.shape.address)
                                                .then((f) => {
                                                    if(f == null) return;
                                                    e.shape.factory = f.id.toString();
                                                    e.save(scanner.dbengine).then( () => {
                                                        console.log(`Pair factory resolved: ${f.name} [${e.shape.factory}]`);
                                                    });
                                                });
                                    }
                                    console.log(`${Colors.BRIGHT_GREEN}[FILTER] ${entity_name} @${receipt.contractAddress} {${id}}${Colors.RESET}`);
                                }
                                //else console.log(`${Colors.YELLOW}[FILTER] ${entity_name} @${receipt.contractAddress} {FAKE}${Colors.RESET}`);
                            });
                    }).catch( (err) => {
                        console.log(`${Colors.RED}${entity_name}[RESOLVE] ${err} ${Colors.RESET}`);
                    });
                });
            }

        }).catch( (err) => {  
            if(scanner.LOG)
                console.log(`${Colors.RED}[FNSCAN] ${err} ${Colors.RESET}`);
        });
    }
}

/* Main Instance of evm-monitor */
const app = new App({
    config: config,
    scanHandler: fnScan
});

/*
    Load eventsMap, it contains all the events you want to listen to, with the relative handler functions. 
    All the events configuration is done through the eventsMap ( see App.eventsMap for more details about its structure).
    The purpose of this structure is to map events to entities and handle them indipendently.
*/
app.loadEvents({
    /*'Pair': {
        abi: require('./abis/pair.json').abi,
        events: [
            { event: 'Swap' },
            { event: 'Transfer'},
            { event: 'Sync' },
            { event: 'Burn' }
        ]
    },*/
    'Factory': {
        abi: require('./abis/Factory.json'),
        events: [ 
            { 
                event: 'PairCreated',
                handler: (l: Listener, e: any) => {
                    //console.log(`${Colors.MAGENTA}[EVENT][${e.event}]: ${Object.keys(e.returnValues).filter(k => k.length > 1).map(k => { if( k.length > 1) return `${k}: ${e.returnValues[k]}` }).join(", ")}${Colors.RESET}`);
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
                            });*/
                            
                        });
                    });
                }
            }
        ]
    },
    /*'MasterChef': {
        abi: require('./abis/masterchef.json'),
        events: [ 
            {  event: 'AddPool' },
            {  event: 'Withdraw' },
            {  event: 'Deposit' },
        ]
    },*/
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

// MasterChef Validator
app.addClockMethod({
    name: 'MasterChef_Validator',
    fn: async (): Promise<void> => {
        MasterChef.all(app.db).then( (collection: MasterChef[]) => {
            collection.map((mc) => {
                new MasterChefRunner({
                    sub: mc,
                    db: app.db,
                    network: app.network
                }).run();
            });
        });
    },
    thick: Timings.m(10)
});

// MasterChef PoolLenght Monitor
app.addClockMethod({
    name: 'MasterChef_PoolLenght_Monitor',
    fn: async (): Promise<void> => {
        MasterChef.all(app.db).then( (collection: MasterChef[]) => {
            collection.map( (mc) => {
                if(app.safe.w3 !== undefined){
                    let c = new (app.safe.w3).eth.Contract(MasterChef.ABI, mc.shape.address);
                    c.methods.poolLength().call().then( (len: number) => {
                        mc.shape.length = len;
                        mc.save(app.db);
                    }).catch( (err: any) => {
                        console.log(`${Colors.RED}[MasterChef_PoolLenght_Monitor] Error: ${err}${Colors.RESET}`);
                    });;;
                }
            });
        });
    },
    thick: Timings.h(1)
});

/* MasterChef Tvl Monitor */
app.addClockMethod({
    name: 'MasterChef_Tvl_Monitor',
    fn: async (): Promise<void> => {
        MasterChef.all(app.db).then( (collection: MasterChef[]) => {
            collection.map( (mc) => {
                if(app.safe.w3 !== undefined){
                    if(mc.shape.length && mc.shape.length > 0 && mc.shape.verified){
                        mc.updateTvl({
                            safe: app.safe,
                            router: app.network.routers["quick"],
                            db: app.db
                        }).catch((err) => {
                            console.log(`${Colors.RED}[MasterChef_Tvl_Monitor] Error: ${err}${Colors.RESET}`);
                        });
                    }
                }
            });
        }).catch(err => {
            console.log(`${Colors.RED}[MasterChef_Tvl_Monitor] Error: ${err}${Colors.RESET}`);
        });
    },
    thick: Timings.h(1)
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
/* ADD MASTERCHEF RUNNER ON TOKEN PRICE */
/* ADD MASTERCHEF RUNNER ON POOL LENGTH CHECK */

app.run().catch( (err) => {
    console.log(err);
});
