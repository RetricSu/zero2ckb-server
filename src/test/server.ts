import path from "path";
import type { 
    QueryOptions,
    WitnessArgs,
    Transaction,
    RawTransaction
} from "@ckb-lumos/base";
import type{
    Cell,
    MultisigScript,
    ContractMode
} from "../lib/builder";
import { Builder } from "../lib/builder";
import { Chain } from "../lib/chain";
import * as Config from "../config/const.json";
import express from "express";
import cors from "cors";
import { JsxEmit } from "typescript";

const corsOptions = {
    origin: Config.CROS_SERVER_LIST,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true
}

const app = express();
app.use(cors(corsOptions));
app.use('/static', express.static(path.join(__dirname, '../../src/script-examples')))

const chain = new Chain();
const builder = new Builder();

app.get( "/", ( req, res ) => {
    res.json( "hello, CKB learner!" );
});

app.get("/get_live_cells", async ( req, res ) => {
    const limit = parseInt(''+req.query.limit) || 10;
    var query:QueryOptions = JSON.parse(''+req.query.query);
    const cells = await chain.queryCell(query, limit);
    res.json(cells);
});

app.get("/get_txs", async ( req, res ) => {
    const limit = parseInt(''+req.query.limit) || 10;
    var query:QueryOptions = JSON.parse(''+req.query.query);
    const cells = await chain.queryTransaction(query, limit);
    //console.log(cells);
    res.json(cells);
});

app.get("/send_tx", async ( req, res ) => {
    /***  
     * todo: this might be attack by malicious
     * need to confirm the str is not harmful before eval it.
     */
    const str = JSON.stringify(eval("(" + req.query.tx + ")"));
    const tx: Transaction = JSON.parse(str);
    console.log(JSON.stringify(tx), tx.version);
    try {
        const tx_hash = await builder.send_tx(tx);
        res.json({status:'ok', data: tx_hash});   
    } catch (error) {
        console.log(error);
        res.json({status:'failed', data: error});
    }
});

app.get("/sign_p2pkh", async ( req, res ) => {
    const raw_tx: RawTransaction = JSON.parse(req.params.raw_tx);
    const witnessesArgs: WitnessArgs[] = JSON.parse(req.params.witnessesArgs);
    const input_cells: Cell[] = JSON.parse(req.params.input_cells);
    try {
        const tx_hash = builder.sign_P2PKH(raw_tx, witnessesArgs, input_cells);
        res.json({status:'ok', data: tx_hash});
    } catch (error) {
        res.json({status:'failed', data: error});
    }
});

app.get("/sign_multisig", async ( req, res ) => {
    const raw_tx: RawTransaction = JSON.parse(req.params.raw_tx);
    const multisigScript: MultisigScript = JSON.parse(req.params.multisigScript);
    const witnessesArgs: WitnessArgs[] = JSON.parse(req.params.witnessesArgs);
    const input_cells: Cell[] = JSON.parse(req.params.input_cells);
    const account_ids: number[] = JSON.parse(req.params.account_ids);
    if(account_ids.length === multisigScript.N){
        try {
            const tx_hash = builder.sign_Multisig(raw_tx, multisigScript, witnessesArgs, input_cells, account_ids);
            res.json({status:'ok', data: tx_hash});
        } catch (error) {
            res.json({status:'failed', data: error});
        }
    }else{
        res.json({status:'failed', data: 'providing args length not matched.'})
    }
});

app.get("/deploy_contract", async ( req, res ) => {
    const raw_tx: RawTransaction = JSON.parse(req.params.raw_tx);
    const compiled_code: string = JSON.parse(req.params.compiled_code);
    const length: number = JSON.parse(req.params.length);
    const input_cells: Cell[] = JSON.parse(req.params.input_cells);
    const mode: ContractMode = JSON.parse(req.params.mode);
    const account_id: number = JSON.parse(req.params.account_ids);
    try {
        const tx_hash = builder.deploy_contract(compiled_code, length, raw_tx, input_cells, mode, account_id);
        res.json({status:'ok', data: tx_hash});
    } catch (error) {
        res.json({status:'failed', data: error});
    }
});

app.get("/deploy_upgradble_contract", async ( req, res ) => {
    const raw_tx: RawTransaction = JSON.parse(req.params.raw_tx);
    const compiled_code: string = JSON.parse(req.params.compiled_code);
    const length: number = JSON.parse(req.params.length);
    const input_cells: Cell[] = JSON.parse(req.params.input_cells);
    const account_id: number = JSON.parse(req.params.account_ids);
    try {
        const tx_hash = builder.deploy_upgradable_contract(compiled_code, length, raw_tx, input_cells, account_id);
        res.json({status:'ok', data: tx_hash});
    } catch (error) {
        res.json({status:'failed', data: error});
    }
});


app.get("/get_seriliazed_witness", async ( req, res  ) => {
    /***  
     * todo: this might be attack by malicious
     * need to confirm the str is not harmful before eval it.
     */
    const str = JSON.stringify(eval("(" + req.query.witnessArgs + ")"));
    const witnessArgs: WitnessArgs = JSON.parse(str);
    try {
        const witness = builder.serializeWitness(witnessArgs);
        res.json({status:'ok', data: witness});
    } catch (error) {
        const err = JSON.stringify(error);
        res.json({status:'failed', data: err});
    }
});


app.get("/get_tx_hash", async ( req, res  ) => {
    /***  
     * todo: this might be attack by malicious
     * need to confirm the str is not harmful before eval it.
     */
    const str = JSON.stringify(eval("(" + req.query.raw_tx + ")"));
    const raw_tx = JSON.parse(str);
    try {
        const tx_hash = builder.generateTxHash(raw_tx);
        res.json({status:'ok', data: tx_hash});
    } catch (error) {
        const err = JSON.stringify(error);
        res.json({status:'failed', data: err});
    }
});

app.get("/get_signature", async ( req, res  ) => {
    const msg: string = req.query.message?.toString() || '';
    const key: string = req.query.private_key?.toString() || '';
    try {
        const signature = builder.signMessageByPrivKey(msg, key);
        res.json({status:'ok', data: signature});
    } catch (error) {
        console.log(error);
        const err = JSON.stringify(error);
        res.json({status:'failed', data: err});
    }
});

app.get("/get_sign_message", async ( req, res  ) => {
    /***  
     * todo: this might be attack by malicious
     * need to confirm the str is not harmful before eval it.
     */
    const str = JSON.stringify(eval("(" + req.query.raw_tx + ")"));
    const raw_tx: RawTransaction = JSON.parse(str);
    const witnessArgs: WitnessArgs[] = JSON.parse(''+req.query.witnessArgs);
    
    const outpoints = raw_tx.inputs.map(input => input.previous_output);
    const input_cells: Cell[] = await chain.getInputCellsByOutpoints(outpoints);
    
    try {
        const tx_hash = builder.generateTxHash(raw_tx);
        const messages = builder.toMessage(tx_hash, raw_tx, witnessArgs, input_cells);
        res.json({status:'ok', data: messages});
    } catch (error) {
        const err = JSON.stringify(error);
        res.json({status:'failed', data: err});
    }
});


app.get("/get_new_blocks", async ( req, res ) => {
    const limit: string = req.query.limit?.toString() || '';
    try {
        const blocks = await chain.getNewBlocks(parseInt(limit));
        res.json({status:'ok', data: blocks});
    } catch (error) {
        console.log(error);
        res.json({status:'failed', data:'error:'+JSON.stringify(error)});
    }
});

app.get("/get_transaction_by_hash", async ( req, res ) => {
    const tx_hash: string = req.query.limit?.toString() || '';
    try {
        const tx = await chain.getTransaction(tx_hash);
        res.json({status:'ok', data: tx});
    } catch (error) {
        console.log(error);
        res.json({status:'failed', data:'error:'+JSON.stringify(error)});
    }
});


app.get("/chain_config", async ( req, res ) => {
    res.json(chain.getChainConfig());
});

app.get("/wallets", async ( req, res ) => {
    res.json(chain.getWallets());
});

app.get("/wallet_by_id", async ( req, res ) => {
    const id = Number(req.params.id);
    res.json(chain.getWalletById(id));
});

app.listen( Config.SERVER_PORT, () => {
    console.log( `server started at http://localhost:${ Config.SERVER_PORT }` );
} );
