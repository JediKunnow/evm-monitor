import { App, Scanner, ScannerFunction } from '../class/base';
import { IConfig } from "../interfaces/IConfig";
import { TransactionReceipt } from 'web3-eth';

const config :IConfig = require('../config/config.js').config;

const ADDRESS_TO_TRACK = "0x1111111254fb6c44bAC0beD2854e76F90643097d";

/* Scanner Function, it'll be executed on each tx ran by the chain */
const fnScan: ScannerFunction = async (scanner: Scanner, receipt: TransactionReceipt) :Promise<void> => {

    if(receipt.from == ADDRESS_TO_TRACK)
        console.log(`[SEND] ${ADDRESS_TO_TRACK} identified as sender in tx with hash: ${receipt.transactionHash}`)
    
    if(receipt.to == ADDRESS_TO_TRACK)
        console.log(`[RECEIVE] ${ADDRESS_TO_TRACK} identified as sender in tx with hash: ${receipt.transactionHash}`)
    
}

/* Main Instance of evm-monitor */
const app = new App({
    config: config,
    scanHandler: fnScan
});

app.run().catch( (err) => {
    console.log(err);
});
