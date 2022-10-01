import { SafeWeb3, Listener, Database, Scanner, fnEHandler, Clock } from "./";
import { Pair, Token, MasterChef } from "../entities";
import { IConfig, INetwork } from "../../interfaces";
import { Factory, Network } from "../models";
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { Colors } from "../utils";

export type EventsMap = {
    [name :string]: {
        abi: AbiItem[];
        events: {
            event: string,
            handler?: fnEHandler
        }[]
    }
}

export type ScannerFunction = (scanner: Scanner, receipt: TransactionReceipt) => Promise<void>;

export class App {

    config: IConfig;
    network: Network;
    db: Database;
    safe: SafeWeb3;
    eventsMap: EventsMap;
    scanner: Scanner;
    clock: Clock;
    fnScan?: ScannerFunction;

    constructor({config, scanHandler}: {config: IConfig, scanHandler: ScannerFunction}){

        this.eventsMap = {};

        this.config = config;
        this.network = this.getNetwork();
        this.db = new Database(config.db, true);

        this.safe = new SafeWeb3({
            network: this.network
        });

        if(!this.safe.load())
            throw new Error(SafeWeb3.DOWNERROR);

        this.scanner = new Scanner({
            safe: this.safe,
            db: this.db,
            network: this.network,
            log: this.config.log,
            filterRules: [
                MasterChef.filterRules,
                Pair.filterRules,
                Token.filterRules
            ],
            fnScan: scanHandler
        });
        
        this.clock = new Clock();
    }

    getNetwork(): Network {
        let net :INetwork | undefined = this.config.networks.find( el => el.name == this.config.network);
        if(net === undefined)
            net = this.config.networks[0];
        
        return new Network(net);
    }

    loadEvents(map: EventsMap): void {
        this.eventsMap = map;
    }

    async handleEvents(): Promise<void> {

        if(this.eventsMap == {}) return;

        for(let e in this.eventsMap){
            switch(e){
                case 'Factory':
                    Factory.all(this.db).then(async collection => {
                        if(collection.length == 0) return;
                        collection.map(async f => {
                            if(f===null) process.exit();
            
                            let E = this.eventsMap[f.constructor.name];
                            try{
                                new Listener(f.name, this.safe, f.constructor.name, { abi: E.abi, address: f.address})
                                .listenTo(E.events);
                            }catch(err){
                                console.log(`${Colors.RED}[LISTENER][${f.constructor.name}] ${err}${Colors.RESET}`);
                            }
                        });
                    });
                break;
                case 'MasterChef':
                    MasterChef.all(this.db).then(async collection => {
                        collection.map(async (m, i) => {
                            if(m===null) process.exit();
                            let E = this.eventsMap[m.constructor.name];
                            try{
                                new Listener([MasterChef.uid, m.shape.name ?? i].join(" "), this.safe, m.constructor.name, { abi: E.abi, address: m.shape.address})
                                .listenTo(E.events);
                            }catch(err){
                                console.log(`${Colors.RED}[LISTENER][${m.constructor.name}] ${err}${Colors.RESET}`);
                            }
                        });
                    });
                break;
            }
        }
    }

    addClockMethod({name, fn, thick} :{name: string, fn: Function, thick: number}) :boolean {
        if(!this.clock.get(name)){
            this.clock.addTimer(name, fn, thick);
            return true;
        }
        return false;
    }

    async run(): Promise<void>{
        this.db.connect().then(() => {
            this.handleEvents();
            this.clock.init();
            this.scanner.init();
        });
    }
}