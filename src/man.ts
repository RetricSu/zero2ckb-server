import * as ckb_sdk from "@nervosnetwork/ckb-sdk-core";

const CKB = ckb_sdk.default;
const nodeUrl = 'http://localhost:8114';
const ckb = new CKB(nodeUrl);

//ckb.generateRawTransaction()
ckb.rpc.sendTransaction