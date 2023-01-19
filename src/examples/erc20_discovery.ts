import { App, EntityFactory, Scanner, ScannerFunction } from '../class/base';
import { FormalEntity, Token } from '../class/entities';
import { IConfig } from "../interfaces/IConfig";
import { UniqueID } from '../class/shapes';
import { Colors } from '../class/utils';
import { TransactionReceipt } from 'web3-eth';

const config :IConfig = require('../config/config.js').config;

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
                        if( e instanceof Token){
                            console.log(`${Colors.BRIGHT_GREEN}[FILTER] ${entity_name} @${receipt.contractAddress}${Colors.RESET}`);
                            e.create(scanner.dbengine)
                                .then( (id) => {
                                    if(id)
                                        console.log(`${Colors.BRIGHT_GREEN}[FILTER] ${entity_name} @${receipt.contractAddress} stored with id {${id}}${Colors.RESET}`);
                                });
                        }
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

app.run().catch( (err) => {
    console.log(err);
});
