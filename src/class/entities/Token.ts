import { BlockExplorer } from "../utils";
import { Database, Entity, FilterRulesItem, SafeWeb3 } from "../base";
import { AbiItem } from 'web3-utils'
import { TokenShape, IToken, UniqueID } from '../shapes';
import { Resolvable } from '../../interfaces';
import { RowDataPacket } from 'mysql2/promise';

export class Token extends Entity<TokenShape> implements Resolvable {
    
    static uid: UniqueID = "Token";
    static ABI: AbiItem[] = require('../../abis/erc20.json').abi as AbiItem[];
    static filterRules: FilterRulesItem = {
        rule: 'name()',
        for: Token.uid,
        next: {
            rule: 'symbol()',
            for: Token.uid,
            next: {
                rule: 'decimals()',
                for: Token.uid,
                next: {
                    rule: 'totalSupply()',
                    for: Token.uid,
                    next: {
                        rule: 'balanceOf()',
                        for: Token.uid,
                    }
                }
            }
        }
    };
    static table: string = "tokens";
    
    constructor( params :IToken) {
        super({
            shape: new TokenShape(params),
            abi: Token.ABI,
            required: ['id', 'network_id', 'created_at'],
            table: Token.table
        });
        this.shape = params;
    }

    get should_save() :boolean {
        if(this.shape.totalSupply)
            return this.shape.totalSupply > 0;
        return false;
    }

    /* 
        Resolvable.resolve(source: any) :Promise<any>
    */
    async resolve(safe: SafeWeb3) :Promise<Token>{

        let result :TokenShape = new TokenShape(this.shape);
        if(safe.w3 === undefined) throw new Error("Resolve failed due an invalid instance of Web3 Provided.");

        try{
    
            var myContractInstance = new safe.w3.eth.Contract( this.abi, this.shape.address);

            try {
                result.circulatingSupply = await BlockExplorer.get_circulating_supply(safe.network, this.shape.address);
            }catch(e){}

            try {
                result.name = await myContractInstance.methods.name().call();
            }catch(e){}

            try {
                result.symbol = await myContractInstance.methods.symbol().call();
            }catch(e){}

            try {
                result.totalSupply = await myContractInstance.methods.totalSupply().call(); 
            }catch(e){}

            try {
                result.owner = await myContractInstance.methods.owner().call();
            }catch(e){}

            if( result.owner !== undefined){
                try {
                    result.ownerBalance = await BlockExplorer.get_owner_balance(safe.network, this.shape.address, result.owner);
                }catch(e){ }
            }else {}
            this.shape = result;
            return this;
        }catch(err){
            console.log(err);
            return this;
        }

    }

    static async get(db: Database, condition: string): Promise<Token | null> {
        
        let r :RowDataPacket[] | null = await db.query(`SELECT * from ${this.table} WHERE ${condition} LIMIT 1`);
        if( r === null) return null;
        if(r.length == 0) return null;
        let x = r[0];
        return new Token({
            id: x['id'],
            network_id: x['network_id'],
            address: x['address'],
            name: x['name'],
            symbol: x['symbol'],
            totalSupply: x['totalSupply'],
            circulatingSupply: x['circulatingSupply'],
            owner: x['owner'],
            ownerBalance: x['ownerBalance'],
            score: x['score'],
            created_at: x['created_at']
        });        
    }

    async markAsSelected(db: Database): Promise<Token> {
        this.shape.score = 1;
        console.log(`Network ID: ${this.shape.network_id}`);
        await this.save(db);
        return this;
    }
}
