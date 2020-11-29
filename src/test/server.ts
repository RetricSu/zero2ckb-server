import type { 
    QueryOptions
 } from "@ckb-lumos/base";
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

const chain = new Chain();

app.get( "/", ( req, res ) => {
    res.json( "hello, CKB learner!" );
});

app.get("/get_live_cells", async ( req, res ) => {
    var query:QueryOptions = JSON.parse(req.params.query);
    const cells = await chain.queryCell(query);
    res.json(cells);
});

app.get("/get_tx", async ( req, res ) => {
    var query:QueryOptions = JSON.parse(req.params.query);
    const cells = await chain.queryTransaction(query);
    res.json(cells);
});

app.get("/send_tx", async ( req, res ) => {

});

app.get("/sign_p2pkh", async ( req, res ) => {

});

app.get("/sign_nultisig", async ( req, res ) => {

});

app.get("/deploy_contract", async ( req, res ) => {

});

app.get("/deploy_upgradble_contract", async ( req, res ) => {

});

app.listen( Config.SERVER_PORT, () => {
    console.log( `server started at http://localhost:${ Config.SERVER_PORT }` );
} );