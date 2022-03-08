import path from "path";
import type {
  QueryOptions,
  WitnessArgs,
  Transaction,
  RawTransaction,
  Cell as FormalCell,
} from "@ckb-lumos/base";
import type { Cell, MultisigScript, ContractMode } from "./lib/builder";
import { Builder } from "./lib/builder";
import { Chain } from "./lib/chain";
import { envConfig } from "./lib/env-config";
import config from "./config/const.json";
import express from "express";
import cors from "cors";

const corsOptions = {
  origin: config.CROS_SERVER_LIST,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};

const PORT = envConfig.port;

const app = express();
app.use(cors(corsOptions));
app.use("/static", express.static(path.join(__dirname, "./contracts")));

console.log("corsOptions: ", corsOptions);

const chain = new Chain();
const builder = new Builder();

app.get("/", (_req, res) => {
  res.json("hello, CKB learner!");
});

app.get("/get_live_cells", async (req, res) => {
  const limit = parseInt("" + req.query.limit) || 10;
  var query: QueryOptions = JSON.parse("" + req.query.query);
  const cells = await chain.queryCell(query, limit);
  res.json(cells);
});

app.get("/get_balance", async (req, res) => {
  const lock_args = "" + req.query.lock_args;
  const balance = await chain.getBalance(lock_args);
  res.json(balance);
});

app.get("/get_txs", async (req, res) => {
  const limit = parseInt("" + req.query.limit) || 10;
  var query: QueryOptions = JSON.parse("" + req.query.query);
  try {
    const cells = await chain.queryTransaction(query, limit);
    //console.log(cells);
    res.json({ status: "ok", data: cells });
  } catch (error: any) {
    res.json({ status: "failed", data: error });
  }
});

app.get("/send_tx", async (req, res) => {
  const tx: Transaction = JSON.parse("" + req.query.tx);
  console.log("receive send_tx =>", tx);
  try {
    const tx_hash = await builder.send_tx(tx);
    res.json({ status: "ok", data: tx_hash });
  } catch (error: any) {
    console.log(error);
    res.json({ status: "failed", data: error.message });
  }
});

app.get("/sign_p2pkh", async (req, res) => {
  const raw_tx: RawTransaction = JSON.parse(req.params.raw_tx);
  const witnessesArgs: WitnessArgs[] = JSON.parse(req.params.witnessesArgs);
  const input_cells: Cell[] = JSON.parse(req.params.input_cells);
  try {
    const tx_hash = builder.sign_P2PKH(raw_tx, witnessesArgs, input_cells);
    res.json({ status: "ok", data: tx_hash });
  } catch (error: any) {
    res.json({ status: "failed", data: error.message });
  }
});

app.get("/sign_multisig", async (req, res) => {
  const raw_tx: RawTransaction = JSON.parse(req.params.raw_tx);
  const multisigScript: MultisigScript = JSON.parse(req.params.multisigScript);
  const witnessesArgs: WitnessArgs[] = JSON.parse(req.params.witnessesArgs);
  const input_cells: Cell[] = JSON.parse(req.params.input_cells);
  const account_ids: number[] = JSON.parse(req.params.account_ids);
  if (account_ids.length === multisigScript.N) {
    try {
      const tx_hash = builder.sign_Multisig(
        raw_tx,
        multisigScript,
        witnessesArgs,
        input_cells,
        account_ids
      );
      res.json({ status: "ok", data: tx_hash });
    } catch (error: any) {
      res.json({ status: "failed", data: error.message });
    }
  } else {
    res.json({ status: "failed", data: "providing args length not matched." });
  }
});

app.get("/deploy_contract", async (req, res) => {
  const raw_tx: RawTransaction = JSON.parse(req.params.raw_tx);
  const compiled_code: string = JSON.parse(req.params.compiled_code);
  const length: number = JSON.parse(req.params.length);
  const input_cells: Cell[] = JSON.parse(req.params.input_cells);
  const mode: ContractMode = JSON.parse(req.params.mode);
  const account_id: number = JSON.parse(req.params.account_ids);
  try {
    const tx_hash = builder.deploy_contract(
      compiled_code,
      length,
      raw_tx,
      input_cells,
      mode,
      account_id
    );
    res.json({ status: "ok", data: tx_hash });
  } catch (error: any) {
    res.json({ status: "failed", data: error.message });
  }
});

app.get("/deploy_upgradable_contract", async (req, res) => {
  const raw_tx: RawTransaction = JSON.parse(req.params.raw_tx);
  const compiled_code: string = JSON.parse(req.params.compiled_code);
  const length: number = JSON.parse(req.params.length);
  const input_cells: Cell[] = JSON.parse(req.params.input_cells);
  const account_id: number = JSON.parse(req.params.account_ids);
  try {
    const tx_hash = builder.deploy_upgradable_contract(
      compiled_code,
      length,
      raw_tx,
      input_cells,
      account_id
    );
    res.json({ status: "ok", data: tx_hash });
  } catch (error: any) {
    res.json({ status: "failed", data: error.message });
  }
});

app.get("/get_serialized_witness", async (req, res) => {
  const witnessArgs: WitnessArgs = JSON.parse("" + req.query.witnessArgs);
  try {
    const witness = builder.serializeWitness(witnessArgs);
    res.json({ status: "ok", data: witness });
  } catch (error: any) {
    res.json({ status: "failed", data: error.message });
  }
});

app.get("/get_serialize_tx", async (req, res) => {
  const raw_tx = JSON.parse("" + req.query.raw_tx);
  try {
    const serialize_tx = builder.generateSerializeTx(raw_tx);
    res.json({ status: "ok", data: serialize_tx });
  } catch (error: any) {
    res.json({ status: "failed", data: error.message });
  }
});

app.get("/get_tx_hash", async (req, res) => {
  const raw_tx = JSON.parse("" + req.query.raw_tx);
  try {
    const tx_hash = builder.generateTxHash(raw_tx);
    res.json({ status: "ok", data: tx_hash });
  } catch (error: any) {
    res.json({ status: "failed", data: error.message });
  }
});

app.get("/get_signature", async (req, res) => {
  const msg: string = req.query.message?.toString() || "";
  const key: string = req.query.private_key?.toString() || "";
  try {
    const signature = builder.signMessageByPrivKey(msg, key);
    res.json({ status: "ok", data: signature });
  } catch (error: any) {
    console.log(error);
    res.json({ status: "failed", data: error.message });
  }
});

app.get("/get_sign_message", async (req, res) => {
  try {
    const raw_tx: RawTransaction = JSON.parse("" + req.query.raw_tx);
    console.log("get sign message for raw_tx", raw_tx);
    const witnesses: string[] = JSON.parse("" + req.query.witnessArgs);
    const outpoints = raw_tx.inputs.map((input) => input.previous_output);
    var input_cells: Cell[] = [];
    input_cells = await chain.getInputCellsByOutpoints(outpoints);
    console.log(outpoints, input_cells);
    try {
      const tx_hash = builder.generateTxHash(raw_tx);
      const messages = builder.toMessage(
        tx_hash,
        raw_tx,
        witnesses,
        input_cells
      );
      res.json({ status: "ok", data: messages });
    } catch (error: any) {
      console.log(error.message);
      res.json({ status: "failed", data: error.message });
    }
  } catch (error: any) {
    console.log(error.message);
    res.json({ status: "failed", data: error.message });
  }
});

app.get("/get_new_blocks", async (req, res) => {
  const limit: string = req.query.limit?.toString() || "";
  try {
    const blocks = await chain.getNewBlocks(parseInt(limit));
    res.json({ status: "ok", data: blocks });
  } catch (error: any) {
    console.log(error);
    res.json({ status: "failed", data: error.message });
  }
});

app.get("/get_transaction_by_hash", async (req, res) => {
  const tx_hash: string = req.query.limit?.toString() || "";
  try {
    const tx = await chain.getTransaction(tx_hash);
    res.json({ status: "ok", data: tx });
  } catch (error: any) {
    console.log(error);
    res.json({ status: "failed", data: "error:" + JSON.stringify(error) });
  }
});

app.get("/get_block_by_tx_hash", async (req, res) => {
  const tx_hash: string = req.query.tx_hash?.toString() || "";
  try {
    const tx = await chain.getTransaction(tx_hash);
    if (tx.tx_status.status === "committed") {
      const block_hash = tx.tx_status.block_hash;
      try {
        const tx = await chain.getBlockByHash(block_hash);
        res.json({ status: "ok", data: tx });
      } catch (error: any) {
        res.json({ status: "failed", data: error.messages });
      }
    } else {
      res.json({ status: "failed", data: `tx status: ${tx.tx_status.status}` });
    }
  } catch (error: any) {
    console.log(error);
    res.json({ status: "failed", data: "error:" + JSON.stringify(error) });
  }
});

app.get("/get_tx_by_hash", async (req, res) => {
  const tx_hash: string = req.query.tx_hash?.toString() || "";
  try {
    const tx = await chain.getTransaction(tx_hash);
    res.json({ status: "ok", data: tx });
  } catch (error: any) {
    console.log(error);
    res.json({ status: "failed", data: "error:" + JSON.stringify(error) });
  }
});

app.get("/get_minimal_cell_capacity", async (req, res) => {
  const cell: FormalCell = JSON.parse("" + req.query.cell);
  try {
    const bytes = chain.getMinimalCapacity(cell);
    console.log(bytes);
    res.json({ status: "ok", data: bytes.toString() });
  } catch (error: any) {
    console.log(error);
    res.json({ status: "failed", data: "error:" + JSON.stringify(error) });
  }
});

app.get("/chain_config", async (req, res) => {
  res.json(chain.getChainConfig());
});

app.get("/wallets", async (req, res) => {
  res.json(chain.getWallets());
});

app.get("/wallet_by_id", async (req, res) => {
  const id = Number(req.params.id);
  res.json(chain.getWalletById(id));
});

app.get("/read_contract", async (req, res) => {
  const fname: string = req.query.f?.toString() || "";
  try {
    res.json(builder.readContractCodeByFileName(fname));
  } catch (error: any) {
    res.json({ status: "failed", err: error });
  }
});

app.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`);
});
