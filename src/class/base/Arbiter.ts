import { SafeWeb3 } from './SafeWeb3';
import { Database } from './Database';
import { Pair } from '../entities';
import { Factory } from '../models/Factory';
import { Colors } from '../utils';
export class Arbiter {

    safe: SafeWeb3;
    db: Database;
    pairs: Pair[];
    factories: Factory[];
    fetched_pairs: Map<Factory, string[]>;

    constructor({safe, db}: {safe: SafeWeb3, db: Database}){
        this.safe = safe;
        this.db = db;
        this.pairs = new Array<Pair>();
        this.factories = new Array<Factory>();
        this.fetched_pairs = new Map<Factory, string[]>();
    }

    private async _loadPairsFromDB(): Promise<void>{
        Pair.all(this.db).then((pairs) => {
            this.pairs = pairs;
        });
    }

    addPairRuntime(pair: Pair): void {
        this.pairs.push(pair);
    }

    async loadFactoriesFromDB(factories?: Factory[]): Promise<void> {
        
        Factory.all(this.db).then((coll) => {
            coll.forEach(el => {
                this.factories.push()
            });
        });

        if(factories){
            factories.forEach(el => {
                this.factories.push(el);
            });
        }
    }

    async fetchPairsFromFactory(factory: Factory): Promise<void> {
        if(this.safe.w3 === undefined) throw new Error(`${Colors.RED}[ARBITER] SAFEWEB3 Unavailable.${Colors.RESET}`);

        let contract = new (this.safe.w3).eth.Contract(Factory.ABI, factory.address);
        let pairs: string[] = new Array<string>();
        let pairs_count = await contract.methods.allPairsLength().call();
        
        for(let i=0;i<pairs_count;i++){
            try{
                pairs.push(await contract.methods.allPairs(i).call());
            }catch(err){
                console.log(`${Colors.RED}[ARBITER] SKIP PAIR${Colors.RESET}`);
            }
        }

        this.fetched_pairs.set(factory, pairs);
    }

    async intersect(): Promise<void> {
        
    }

}