// ref: https://github.com/nervosnetwork/ckb-system-scripts/wiki/How-to-sign-transaction

// sign a P2PH tx
import { SerializeScript } from "./blockchain";
import type {
    CellDep,
    Script,
    CellInput,
    CellInputVec,
    CellOutput,
    CellOutputVec,

    RawTransaction
} from "./blockchain";


const get_input_group = function(inputs: CellInput[]){
    const groups = [];
    inputs.forEach(input => {
        script_hash = blake256(serialize(input.lock));
        groups[script_hash].append(i);
    });
    return groups;
}

const sign_p2ph_tx = function(){
    const group = get_input_group();
    
}