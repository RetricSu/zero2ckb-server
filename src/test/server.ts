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
    //var query:QueryOptions = JSON.parse(req.params.query);
    var query:QueryOptions = {lock:{
        hash_type: 'type',
        code_hash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        args: '0x43d509d97f26007a285f39241cffcd411157196c'
    }};
    const cells = await chain.queryCell(query);
    res.json(cells);
});

app.get("/get_tx", async ( req, res ) => {
    //console.log(req.params.query);
    //var query:QueryOptions = JSON.parse(req.params.query);
    var query:QueryOptions = {lock:{
        hash_type: 'type',
        code_hash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        args: '0x43d509d97f26007a285f39241cffcd411157196c'
    }};
    const cells = await chain.queryTransaction(query);
    //console.log(cells);
    res.json(cells);
});

app.get("/send_tx", async ( req, res ) => {
    var tx: Transaction = JSON.parse(req.params.tx);
    const tx_hash = await builder.send_tx(tx);
    res.json(tx_hash);
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