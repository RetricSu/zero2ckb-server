import { Indexer, CellCollector, TransactionCollector } from "@ckb-lumos/indexer";
import type { 
    QueryOptions,
    OutPoint,
    Cell
} from "@ckb-lumos/base";
import type { Cell as SimpleCell } from '../lib/builder';
import User from "../config/user.json";
import Const from "../config/const.json";
import Config from "../config/dev_cofig.json";
import { RPC } from "ckb-js-toolkit";

export class Chain {
    private indexer;

    constructor(){
        this.indexer = new Indexer(Const.RPC_URL, Const.DB_URL);
        this.indexer.startForever();
    }

    async queryCell(query: QueryOptions, _limit?: number){
        const limit = _limit || 10;
        const cellCollector = new CellCollector(this.indexer, {...query, ...{order: 'desc'}});
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

    async getInputCellsByOutpoints(
        outpoints: OutPoint[]
      ){
        const rpc = new RPC(Const.RPC_URL);
        const cells: SimpleCell[] = [];

        for(let i=0;i<outpoints.length;i++){
            const data = await rpc.get_live_cell(outpoints[i], true);
            if(data.status === "live")
                cells.push({...data.cell.output, ...{data: data.cell.data.content}});
            else continue;
        }

        return cells;
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