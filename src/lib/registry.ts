import { Service } from "./http-server";
import type {
  QueryOptions,
  WitnessArgs,
  Transaction,
  RawTransaction,
  Cell as FormalCell,
} from "@ckb-lumos/base";
import type { Cell, MultisigScript, ContractMode } from "./builder";
import { Chain } from "./chain";
import { Builder } from "./builder";

const logger = {
  error: (err: Error | string) => {
    console.log(err);
  },
  info: (err: Error | string) => {
    console.log(err);
  },
  debug: (err: Error | string) => {
    console.log(err);
  },
  warning: (err: Error | string) => {
    console.log(err);
  },
};

const chain = new Chain();
const builder = new Builder();

const defaultMainServiceName = `zero2CKB api server`;

export class MainRegistry extends Service {
  constructor(name: string = defaultMainServiceName, req?: any, res?: any) {
    super(name, req, res);
  }

  async get_live_cells() {
    const limit = parseInt("" + this.req.query.limit) || 10;
    var query: QueryOptions = JSON.parse("" + this.req.query.query);
    const cells = await chain.queryCell(query, limit);
    return cells;
  }

  async get_balance() {
    const lock_args = "" + this.req.query.lock_args;
    const balance = await chain.getBalance(lock_args);
    return balance;
  }

  async get_txs() {
    const limit = parseInt("" + this.req.query.limit) || 10;
    var query: QueryOptions = JSON.parse("" + this.req.query.query);
    const txs = await chain.queryTransaction(query, limit);
    return txs;
  }

  async send_tx() {
    const req = this.req;
    const tx: Transaction = JSON.parse("" + req.query.tx);
    console.log("receive send_tx =>", tx);
    const tx_hash = await builder.send_tx(tx);
    return tx_hash;
  }

  async sign_p2pkh() {
    const raw_tx: RawTransaction = JSON.parse(this.req.params.raw_tx);
    const witnessesArgs: WitnessArgs[] = JSON.parse(
      this.req.params.witnessesArgs
    );
    const input_cells: Cell[] = JSON.parse(this.req.params.input_cells);
    const tx_hash = builder.sign_P2PKH(raw_tx, witnessesArgs, input_cells);
    return tx_hash;
  }

  async sign_multisig() {
    const raw_tx: RawTransaction = JSON.parse(this.req.params.raw_tx);
    const multisigScript: MultisigScript = JSON.parse(
      this.req.params.multisigScript
    );
    const witnessesArgs: WitnessArgs[] = JSON.parse(
      this.req.params.witnessesArgs
    );
    const input_cells: Cell[] = JSON.parse(this.req.params.input_cells);
    const account_ids: number[] = JSON.parse(this.req.params.account_ids);
    if (account_ids.length === multisigScript.N) {
      const tx_hash = builder.sign_Multisig(
        raw_tx,
        multisigScript,
        witnessesArgs,
        input_cells,
        account_ids
      );
      return tx_hash;
    } else {
      throw new Error("providing args length not matched.");
    }
  }

  async deploy_contract() {
    const req = this.req;
    const raw_tx: RawTransaction = JSON.parse(req.params.raw_tx);
    const compiled_code: string = JSON.parse(req.params.compiled_code);
    const length: number = JSON.parse(req.params.length);
    const input_cells: Cell[] = JSON.parse(req.params.input_cells);
    const mode: ContractMode = JSON.parse(req.params.mode);
    const account_id: number = JSON.parse(req.params.account_ids);
    const tx_hash = builder.deploy_contract(
      compiled_code,
      length,
      raw_tx,
      input_cells,
      mode,
      account_id
    );
    return tx_hash;
  }

  async deploy_upgradable_contract() {
    const req = this.req;
    const raw_tx: RawTransaction = JSON.parse(req.params.raw_tx);
    const compiled_code: string = JSON.parse(req.params.compiled_code);
    const length: number = JSON.parse(req.params.length);
    const input_cells: Cell[] = JSON.parse(req.params.input_cells);
    const account_id: number = JSON.parse(req.params.account_ids);
    const tx_hash = builder.deploy_upgradable_contract(
      compiled_code,
      length,
      raw_tx,
      input_cells,
      account_id
    );
    return tx_hash;
  }

  async get_serialized_witness() {
    const req = this.req;

    const witnessArgs: WitnessArgs = JSON.parse("" + req.query.witnessArgs);
    const witness = builder.serializeWitness(witnessArgs);
    return witness;
  }

  async get_serialize_tx() {
    const raw_tx = JSON.parse("" + this.req.query.raw_tx);
    const serialize_tx = builder.generateSerializeTx(raw_tx);
    return serialize_tx;
  }

  async get_tx_hash() {
    const raw_tx = JSON.parse("" + this.req.query.raw_tx);
    const tx_hash = builder.generateTxHash(raw_tx);
    return tx_hash;
  }

  async get_signature() {
    const req = this.req;
    const msg: string = req.query.message?.toString() || "";
    const key: string = req.query.private_key?.toString() || "";
    const signature = builder.signMessageByPrivKey(msg, key);
    return signature;
  }

  async get_sign_message() {
    const req = this.req;
    const raw_tx: RawTransaction = JSON.parse(req.query.raw_tx);
    console.log("get sign message for raw_tx", raw_tx);
    const witnesses: string[] = JSON.parse(req.query.witnessArgs);
    const outpoints = raw_tx.inputs.map((input) => input.previous_output);
    var input_cells: Cell[] = [];
    input_cells = await chain.getInputCellsByOutpoints(outpoints);
    console.log("outpoints: ", outpoints, "input_cells: ", input_cells);
    if (input_cells.length === 0) {
      throw new Error(
        `no alive cells found from OutPoints: ${JSON.stringify(
          outpoints,
          null,
          0
        ).replace(
          /\\/g,
          ""
        )}. Please try refreshing live cells and constructing transaction using new cells.`
      );
    }

    const tx_hash = builder.generateTxHash(raw_tx);
    const messages = builder.toMessage(tx_hash, raw_tx, witnesses, input_cells);
    return messages;
  }

  async get_new_blocks() {
    const req = this.req;
    const limit: string = req.query.limit?.toString() || "";
    const blocks = await chain.getNewBlocks(parseInt(limit));
    return blocks;
  }

  async get_transaction_by_hash() {
    const req = this.req;
    const tx_hash: string = req.query.limit?.toString() || "";
    const tx = await chain.getTransaction(tx_hash);
    return tx;
  }

  async get_block_by_tx_hash() {
    const req = this.req;
    const tx_hash: string = req.query.tx_hash?.toString() || "";
    const tx = await chain.getTransaction(tx_hash);
    if (tx.tx_status.status === "committed") {
      const block_hash = tx.tx_status.block_hash;
      {
        const tx = await chain.getBlockByHash(block_hash);
        return tx;
      }
    } else {
      throw new Error(`tx status: ${tx.tx_status.status}`);
    }
  }

  async get_tx_by_hash() {
    const req = this.req;
    const tx_hash: string = req.query.tx_hash?.toString() || "";
    const tx = await chain.getTransaction(tx_hash);
    return tx;
  }

  async get_minimal_cell_capacity() {
    const req = this.req;
    const cell: FormalCell = JSON.parse("" + req.query.cell);
    const bytes = chain.getMinimalCapacity(cell);
    return bytes.toString();
  }

  async chain_config() {
    return chain.getChainConfig();
  }

  async wallets() {
    return chain.getWallets();
  }

  async wallet_by_id() {
    const req = this.req;
    const id = Number(req.params.id);
    return chain.getWalletById(id);
  }

  async read_contract() {
    const req = this.req;
    const fname: string = req.query.f?.toString() || "";
    return builder.readContractCodeByFileName(fname);
  }
}
