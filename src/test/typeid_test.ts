import { MultisigScript, Cell, Builder } from "../lib/builder";
import * as Config from "../config/dev_cofig.json";
import * as Const from "../config/const.json";
import {
  core,
  utils,
  DepType,
  Input,
  Output,
  CellDep,
  Hash,
  Script,
  WitnessArgs,
  OutPoint,
  HexString,
  Transaction,
  RawTransaction,
} from "@ckb-lumos/base";

const builder = new Builder();


// deploy type-id contract
async function deploy(){
    const {length, code} = builder.generateTypeIDContractCode();

    var raw_tx: RawTransaction = builder.generateRawTxTemplate();
    
    const input: Input = {
      previous_output: {
        tx_hash: '0x8ed1caf09e6849331d611052f76ba17087f99541ab9fc25ded5a7a4689bfff12',
        index: '0x0'
      },
      since: '0x0'
    };
    const input_cells: Cell[] = [{
      capacity: '0x' + 20098682952991n.toString(16),
      lock: {
        code_hash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        args: '0x43d509d97f26007a285f39241cffcd411157196c',
        hash_type: 'type'
      },
      data: '0x',
      out_point: {
        tx_hash: '0x8ed1caf09e6849331d611052f76ba17087f99541ab9fc25ded5a7a4689bfff12',
        index: '0x0'
      }
    }]
    const cell_dep: CellDep = {
      out_point: {
        tx_hash: '0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708',
        index: '0x0'
      },
      dep_type: 'dep_group'
    }

    raw_tx.cell_deps.push(cell_dep);
    raw_tx.inputs.push(input);

    const tx = builder.deploy_contract(code, length, raw_tx, input_cells, 'normal');
    console.log(tx);

    const tx_hash = await builder.send_tx(tx);
    //tx_hash: 0xc960f9cdcd44b843f8344cea3b04bcbdbb5e91fd070ccbc3be722eedceac8735
    console.log(tx_hash)
    //now let's try to use this contract
    
}

//deploy();

// use the on-chain typeid contract to make our own contract deploying upgradable.
async function use_contract() {

  const raw_tx: RawTransaction = builder.generateRawTxTemplate();

  //const {length, code} = builder.generateTypeIDContractCode();
  //const code_hash = builder.generateCodeHash(code);
  //console.log("code hash should equals: ",code_hash === "0x733cc63612c025dd72a417d721a7f102c96d422586ac894975ce0f23b2a81258");

  const {length, code} = builder.generateTestContractCode(); //use carrot as upgradable contract code

  const input: Input = {
    previous_output: {
      tx_hash: '0x51d36d3b6e57052cfa7626ed5c4e30ebc2c7d001025a8c2f84e4864712f13539',
      index: '0x0'
    },
    since: '0x0'
  };
  const input_cells: Cell[] = [{
    capacity: '0x' + 20098676029352n.toString(16),
    lock: {
      code_hash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
      args: '0x43d509d97f26007a285f39241cffcd411157196c',
      hash_type: 'type'
    },
    data: '0x',
    out_point: {
      tx_hash: '0x51d36d3b6e57052cfa7626ed5c4e30ebc2c7d001025a8c2f84e4864712f13539',
      index: '0x0'
    }
  }]
  const cell_deps: CellDep[] = [
    {
      out_point: { // secp256
        tx_hash: '0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708',
        index: '0x0'
      },
      dep_type: 'dep_group'
    },
    {
      out_point: { // the contract contained type_id code
        tx_hash: '0xc960f9cdcd44b843f8344cea3b04bcbdbb5e91fd070ccbc3be722eedceac8735',
        index: '0x0'
      },
      dep_type: 'code'
    }
  ];
  
  raw_tx.cell_deps = cell_deps;
  raw_tx.inputs.push(input);

  const tx = await builder.deploy_upgradable_contract(code, length, raw_tx, input_cells);
  const tx_hash = await builder.send_tx(tx);
  console.log(tx, tx_hash);
}
// use_contract();
// tx_hash: 0x0374ba76e54f58bcd572ac6b838b76fd729d4282773f02ac031b513ed6232c39


// let's try upgradabling our own contract.
async function upgrade_contract() {
  const raw_tx: RawTransaction = builder.generateRawTxTemplate();

  //const {length, code} = builder.generateTypeIDContractCode();
  //const code_hash = builder.generateCodeHash(code);
  //console.log("code hash should equals: ",code_hash === "0x733cc63612c025dd72a417d721a7f102c96d422586ac894975ce0f23b2a81258");

  const {length, code} = builder.generateTestUpgradableContractCode(); //use carrot as upgradable contract code

  const input: Input = {
    previous_output: {
      tx_hash: '0x0374ba76e54f58bcd572ac6b838b76fd729d4282773f02ac031b513ed6232c39',
      index: '0x0'
    },
    since: '0x0'
  };
  const input_cells: Cell[] = [{ // the original carrot cell
    capacity: '0xbb49f9ec00',
    lock: {
      code_hash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
      args: '0x43d509d97f26007a285f39241cffcd411157196c',
      hash_type: 'type'
    },
    type: {
      code_hash: '0x733cc63612c025dd72a417d721a7f102c96d422586ac894975ce0f23b2a81258',
      args: '0x000000000000000051d36d3b6e57052cfa7626ed5c4e30ebc2c7d001025a8c2f84e4864712f1353900000000',
      hash_type: 'data'
    },
    data: builder.generateTestContractCode().code,
    out_point: {
      tx_hash: '0x0374ba76e54f58bcd572ac6b838b76fd729d4282773f02ac031b513ed6232c39',
      index: '0x0'
    }
  }]
  const cell_deps: CellDep[] = [
    {
      out_point: { // secp256
        tx_hash: '0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708',
        index: '0x0'
      },
      dep_type: 'dep_group'
    },
    {
      out_point: { // the contract contained type_id code
        tx_hash: '0xc960f9cdcd44b843f8344cea3b04bcbdbb5e91fd070ccbc3be722eedceac8735',
        index: '0x0'
      },
      dep_type: 'code'
    }
  ];
  const outputs: Output[] = [
    { // the cell contained new upgradable contract code
      capacity: '0x' + 794400000000n.toString(16),
      lock: {
        code_hash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        args: '0x43d509d97f26007a285f39241cffcd411157196c',
        hash_type: 'type'
      },
      type: {
        code_hash: '0x733cc63612c025dd72a417d721a7f102c96d422586ac894975ce0f23b2a81258',
        args: '0x000000000000000051d36d3b6e57052cfa7626ed5c4e30ebc2c7d001025a8c2f84e4864712f1353900000000',
        hash_type: 'data'
      },
    },
    { // output cell 2
      capacity: '0x' + 7000000000n.toString(16),
      lock: {
        code_hash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        args: '0x43d509d97f26007a285f39241cffcd411157196c',
        hash_type: 'type'
      }
    }
  ]

  raw_tx.cell_deps = cell_deps;
  raw_tx.inputs.push(input);
  raw_tx.outputs = outputs;
  raw_tx.outputs_data[0] = code;
  raw_tx.outputs_data[1] = '0x';


  const witnessArgs: WitnessArgs[] = [{
    lock: '0x'
  }]

  const tx = builder.sign_P2PKH(raw_tx, witnessArgs, input_cells);
  const tx_hash = await builder.send_tx(tx);
  console.log(tx, tx_hash);
}

//upgrade_contract();
//tx_hash: 0xbd01ff34d078f3881d60076baa550b495d81706e94839190d7e3cf3b5838f54d

async function test_contract() {
  const raw_tx: RawTransaction = builder.generateRawTxTemplate();

  const whole_money = 20098662182385n;
  const tx_fee = 100000000n;
  const output_money = whole_money - tx_fee - BigInt(61+10) * 100000000n;
  const remain_money = whole_money - output_money - tx_fee;

  const input: Input = {
    previous_output: {
      tx_hash: '0xda10c8b1fd3c68f46279acb546524fca7e253b41acf3373769e13f070772bcb4',
      index: '0x0'
    },
    since: '0x0'
  };
  const input_cells: Cell[] = [{
    capacity: '0x' + whole_money.toString(16),
    lock: {
      code_hash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
      args: '0x43d509d97f26007a285f39241cffcd411157196c',
      hash_type: 'type'
    },
    data: '0x',
    out_point: {
      tx_hash: '0xda10c8b1fd3c68f46279acb546524fca7e253b41acf3373769e13f070772bcb4',
      index: '0x0'
    }
  }]
  const witnessArgs: WitnessArgs[] = [{
    lock: '0x'
  }]
  const cell_deps: CellDep[] = [
    {
      out_point: { // secp256
        tx_hash: '0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708',
        index: '0x0'
      },
      dep_type: 'dep_group'
    },
    {
      out_point: { // the new contract contained upgradable parrot code
        tx_hash: '0xbd01ff34d078f3881d60076baa550b495d81706e94839190d7e3cf3b5838f54d',
        index: '0x0'
      },
      dep_type: 'code'
    }
  ];
  const outputs: Output[] = [
    { // ouput cell 1
      capacity: '0x' + output_money.toString(16),
      lock: {
        code_hash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        args: '0x43d509d97f26007a285f39241cffcd411157196c',
        hash_type: 'type'
      },
      type: {
        args: '0x',
        code_hash: '0x83ff58dd574613f51098835b5d5578a211eacdbf78fbc32263bccc91370a02a5',
        hash_type: 'type'
      },
    },
    { // output cell 2
      capacity: '0x' + remain_money.toString(16),
      lock: {
        code_hash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        args: '0x43d509d97f26007a285f39241cffcd411157196c',
        hash_type: 'type'
      }
    }
  ]
  raw_tx.cell_deps = cell_deps;
  raw_tx.inputs.push(input);
  raw_tx.outputs = outputs;
  raw_tx.outputs_data = ['0x'+Buffer.from('carrot123').toString('hex'), '0x'];

  const tx = await builder.sign_P2PKH(raw_tx, witnessArgs, input_cells);
  const tx_hash = await builder.send_tx(tx);
  console.log(tx_hash);
}

test_contract();

/** 
 * - capacity: 200986.96800583 (CKB)
          data_bytes: 0
          index:
            output_index: 0
            tx_index: 0
          lock_hash: 0x3bab60cef4af81a87b0386f29bbf1dd0f6fe71c9fe1d84ca37096a6284d3bdaf
          mature: true
          number: 32
          output_index: 0
          tx_hash: 0xfef8abbc188d7a003fe1f48fc7aa454c63a258039be6d27f161e9df2d36ac460
          type_hashes: ~'
 */