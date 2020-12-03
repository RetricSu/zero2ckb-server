import { Indexer, CellCollector, TransactionCollector } from "@ckb-lumos/indexer";
import type { 
    QueryOptions
} from "@ckb-lumos/base";
import * as User from "../config/user.json";
import * as Const from "../config/const.json";
import * as Config from "../config/dev_cofig.json";

export class Chain {
    private indexer;

    constructor(){
        this.indexer = new Indexer(Const.RPC_URL, Const.DB_URL);
        this.indexer.startForever();
    }

    async queryCell(query: QueryOptions, _limit?: number){
        const limit = _limit || 10;
        const cellCollector = new CellCollector(this.indexer, query);
        const result = [];
        for await(const cell of cellCollector.collect()){
            result.push(cell);
            if(result.length > limit){
                break;
            }
        } 
        return result;
    }

    async queryTransaction(query: QueryOptions, _limit?: number){
        const limit = _limit || 10;
        const txColletor = new TransactionCollector(this.indexer, query);
        const result = [];
        for await(const cell of txColletor.collect()){
            result.push(cell);
            if(result.length > limit){
                break;
            }
        } 
        return result;
    }

    queryBlock(){

    }

    queryWallet(){

    }

    queryCellMetaData(){
        
    }

    queryScript(){

    }

    getChainConfig(){
        return Config;
    }

    getWallets(){
        return User.account;
    }

    getWalletById(id: number){
        return User.account[id];
    }
}