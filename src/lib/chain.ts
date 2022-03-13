import {
  Indexer,
  CellCollector,
  TransactionCollector,
} from "@ckb-lumos/indexer";
import type { QueryOptions, OutPoint, Cell } from "@ckb-lumos/base";
import User from "../config/user.json";
import chainConfig from "../config/lumos-config.json";
import { RPC } from "ckb-js-toolkit";
import utils from "./utils";
import { minimalCellCapacity } from "@ckb-lumos/helpers";
import { envConfig } from "./env-config";

export class Chain {
  private indexer;
  private rpc;

  constructor() {
    this.indexer = new Indexer(envConfig.ckbRpc, envConfig.indexerDbPath);
    this.indexer.startForever();
    this.rpc = new RPC(envConfig.ckbRpc);
  }

  async queryCell(query: QueryOptions, _limit?: number) {
    const limit = _limit || 10;
    const cellCollector = new CellCollector(this.indexer, query); //order: 'desc'
    const result = [];
    for await (const cell of cellCollector.collect()) {
      result.push(cell);
      if (result.length >= limit) {
        break;
      }
    }
    return result;
  }

  async getBalance(lock_args: string) {
    /**   todo   */
    return 0;
  }

  async queryTransaction(query: QueryOptions, _limit?: number) {
    const limit = _limit || 10;
    const txCollector = new TransactionCollector(this.indexer, query);
    const result = [];
    for await (const cell of txCollector.collect()) {
      result.push(cell);
      if (result.length > limit) {
        break;
      }
    }
    return result;
  }

  async getInputCellsByOutpoints(outpoints: OutPoint[]) {
    const cells: Array<any> = [];

    const get_live_cell = async (num: number): Promise<Cell | undefined> => {
      const data = await this.rpc.get_live_cell(outpoints[num], true);
      console.log(
        "rpc.get_live_cell, response, outpoint",
        data,
        outpoints[num]
      );
      if (data.status === "live") {
        let c: Cell = {
          ...data.cell.output,
          ...{ data: data.cell.data.content },
        };
        return c;
      } else {
        return undefined;
      }
    };

    let find_cells = utils.asyncGenerator(0, outpoints.length, get_live_cell);
    for await (let cell of find_cells) {
      if (cell !== undefined) cells.push(cell);
    }

    return cells;
  }

  async getNewBlocks(limit: number) {
    const height = await this.rpc.get_tip_block_number();
    if (BigInt(height) < BigInt(limit)) {
      limit = +BigInt(height).toString(10);
    }
    console.log(`try to get new blocks, limit: ${limit}`);
    const blocks: Array<any> = [];

    const fetch = async (num: number) => {
      const startBlockNumber =
        BigInt(height) - BigInt(num) > 0 ? BigInt(height) - BigInt(num) : 0n;
      const block_number = "0x" + startBlockNumber.toString(16);
      const block = await this.rpc.get_block_by_number(block_number);
      return block;
    };

    let fetching_blocks = utils.asyncGenerator(0, limit, fetch);
    for await (let block of fetching_blocks) {
      blocks.push(block);
    }
    return blocks;
  }

  async getTransaction(tx_hash: string) {
    const tx = await this.rpc.get_transaction(tx_hash);
    return tx;
  }

  async getBlockByHash(block_hash: string) {
    const block = await this.rpc.get_block(block_hash);
    return block;
  }

  queryWallet() {}

  queryCellMetaData() {}

  queryScript() {}

  getChainConfig() {
    return chainConfig;
  }

  getWallets() {
    return User.account;
  }

  getWalletById(id: number) {
    return User.account[id];
  }

  getMinimalCapacity(cell: Cell) {
    return minimalCellCapacity(cell);
  }
}
