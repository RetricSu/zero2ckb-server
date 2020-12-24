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
import utils from './utils';

export class Chain {
    private indexer;
    private rpc;

    constructor(){
        this.indexer = new Indexer(Const.RPC_URL, Const.DB_URL);
        this.indexer.startForever();
        this.rpc = new RPC(Const.RPC_URL);
    }

    async queryCell(query: QueryOptions, _limit?: number){
        const limit = _limit || 10;
        const cellCollector = new CellCollector(this.indexer, query);//order: 'desc'
        const result = [];
        for await(const cell of cellCollector.collect()){
            result.push(cell);
            if(result.length >= limit){
                break;
            }
        } 
        return result;
    }

    async getBalance(lock_args: string){
        /**   todo   */
        return 0;
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
        const cells: SimpleCell[] = [];
        for(let i=0;i<outpoints.length;i++){
            const data = await this.rpc.get_live_cell(outpoints[i], true);
            if(data.status === "live")
                cells.push({...data.cell.output, ...{data: data.cell.data.content}});
            else continue;
        }

        return cells;
    }

    async getNewBlocks(limit: number){
        const height =  await this.rpc.get_tip_block_number();
        const blocks:Array<any> = [];

        const fetch = async (num: number)=> {
            const block_number = '0x' + (BigInt(height) - BigInt(num)).toString(16);
            const block = await this.rpc.get_block_by_number(block_number);
            return block;
        }

        let fetching_blocks = utils.asyncGenerator(0, limit, fetch);
        for await (let block of fetching_blocks) {
            blocks.push(block);
        }
        return blocks;
    }

    async getTransaction(tx_hash: string){
        const tx = await this.rpc.get_transaction(tx_hash);
        return tx;
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