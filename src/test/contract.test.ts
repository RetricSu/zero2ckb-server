import { Cell, Builder } from "../lib/builder";
import {
  Input,
  Output,
  CellDep,
  WitnessArgs,
  RawTransaction,
} from "@ckb-lumos/base";

const builder = new Builder();

async function test() {
  const { length, code } = builder.generateTestContractCode();

  var raw_tx: RawTransaction = builder.generateRawTxTemplate();

  const input: Input = {
    previous_output: {
      tx_hash:
        "0xfef8abbc188d7a003fe1f48fc7aa454c63a258039be6d27f161e9df2d36ac460",
      index: "0x0",
    },
    since: "0x0",
  };
  const input_cells: Cell[] = [
    {
      capacity: "0x" + 20098696800583n.toString(16),
      lock: {
        code_hash:
          "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        args: "0x43d509d97f26007a285f39241cffcd411157196c",
        hash_type: "type",
      },
      data: "0x",
      out_point: {
        tx_hash:
          "0xfef8abbc188d7a003fe1f48fc7aa454c63a258039be6d27f161e9df2d36ac460",
        index: "0x0",
      },
    },
  ];
  const cell_dep: CellDep = {
    out_point: {
      tx_hash:
        "0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708",
      index: "0x0",
    },
    dep_type: "dep_group",
  };

  raw_tx.cell_deps.push(cell_dep);
  raw_tx.inputs.push(input);

  const tx = builder.deploy_contract(
    code,
    length,
    raw_tx,
    input_cells,
    "normal"
  );
  //console.log(tx, code_hash);

  //const tx_hash = await builder.send_tx(tx);
  //tx_hash: 0x9e2619e67244ecb90c9754c022c26537bd4c492f002c220ba910227bf0d17a59

  //now let's try to use this contract
}

async function use_contract() {
  const raw_tx: RawTransaction = builder.generateRawTxTemplate();

  const { length, code } = builder.generateTestContractCode();
  const code_hash = builder.generateCodeHash(code);

  const whole_money = 20098689876735n;
  const tx_fee = 100000000n;
  const output_money = whole_money - tx_fee - BigInt(61 + 10) * 100000000n;
  const remain_money = whole_money - output_money - tx_fee;

  const input: Input = {
    previous_output: {
      tx_hash:
        "0x6aa19cc508a4c3c3ea80c2553ea8d4ba94e1e421e17be89c9925f5dbcf65d1cc",
      index: "0x0",
    },
    since: "0x0",
  };
  const input_cells: Cell[] = [
    {
      capacity: "0x" + whole_money.toString(16),
      lock: {
        code_hash:
          "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        args: "0x43d509d97f26007a285f39241cffcd411157196c",
        hash_type: "type",
      },
      data: "0x",
      out_point: {
        tx_hash:
          "0x6aa19cc508a4c3c3ea80c2553ea8d4ba94e1e421e17be89c9925f5dbcf65d1cc",
        index: "0x0",
      },
    },
  ];
  const witnessArgs: WitnessArgs[] = [
    {
      lock: "0x",
    },
  ];
  const cell_deps: CellDep[] = [
    {
      out_point: {
        // secp256
        tx_hash:
          "0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708",
        index: "0x0",
      },
      dep_type: "dep_group",
    },
    {
      out_point: {
        // the contract contained carrot code
        tx_hash:
          "0x9e2619e67244ecb90c9754c022c26537bd4c492f002c220ba910227bf0d17a59",
        index: "0x0",
      },
      dep_type: "code",
    },
  ];
  const outputs: Output[] = [
    {
      // the cell which use the contrace
      capacity: "0x" + output_money.toString(16),
      lock: {
        code_hash:
          "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        args: "0x43d509d97f26007a285f39241cffcd411157196c",
        hash_type: "type",
      },
      type: {
        code_hash: code_hash,
        args: "0x",
        hash_type: "data",
      },
    },
    {
      // the cell of remain capacity
      capacity: "0x" + remain_money.toString(16),
      lock: {
        code_hash:
          "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        args: "0x43d509d97f26007a285f39241cffcd411157196c",
        hash_type: "type",
      },
    },
  ];
  raw_tx.cell_deps = cell_deps;
  raw_tx.inputs.push(input);
  raw_tx.outputs = outputs;
  raw_tx.outputs_data = ["0x", "0x"];

  const tx = await builder.sign_P2PKH(raw_tx, witnessArgs, input_cells);
  const tx_hash = await builder.send_tx(tx);
  console.log(tx_hash);
}
//use_contract();
// tx_hash: 0x84ff7750525078e7e016a16e4d8f7a2c7df8959a3fc1e7262c81677d6ecc126d

async function test_contract() {
  const raw_tx: RawTransaction = builder.generateRawTxTemplate();

  const whole_money = 20091489876735n;
  const tx_fee = 100000000n;
  const output_money = whole_money - tx_fee - BigInt(61 + 10) * 100000000n;
  const remain_money = whole_money - output_money - tx_fee;

  const input: Input = {
    previous_output: {
      tx_hash:
        "0x84ff7750525078e7e016a16e4d8f7a2c7df8959a3fc1e7262c81677d6ecc126d",
      index: "0x0",
    },
    since: "0x0",
  };
  const input_cells: Cell[] = [
    {
      capacity: "0x" + whole_money.toString(16),
      lock: {
        code_hash:
          "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        args: "0x43d509d97f26007a285f39241cffcd411157196c",
        hash_type: "type",
      },
      type: {
        args: "0x",
        code_hash:
          "0x481e019212aabec00cc8f4ff1f05b20f81c1d7a1450a07d88bb7873bb94c72f6",
        hash_type: "data",
      },
      data: "0x",
      out_point: {
        tx_hash:
          "0x84ff7750525078e7e016a16e4d8f7a2c7df8959a3fc1e7262c81677d6ecc126d",
        index: "0x0",
      },
    },
  ];
  const witnessArgs: WitnessArgs[] = [
    {
      lock: "0x",
    },
  ];
  const cell_deps: CellDep[] = [
    {
      out_point: {
        // secp256
        tx_hash:
          "0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708",
        index: "0x0",
      },
      dep_type: "dep_group",
    },
    {
      out_point: {
        // the contract contained carrot code
        tx_hash:
          "0x9e2619e67244ecb90c9754c022c26537bd4c492f002c220ba910227bf0d17a59",
        index: "0x0",
      },
      dep_type: "code",
    },
  ];
  const outputs: Output[] = [
    {
      // ouput cell 1
      capacity: "0x" + output_money.toString(16),
      lock: {
        code_hash:
          "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        args: "0x43d509d97f26007a285f39241cffcd411157196c",
        hash_type: "type",
      },
      type: {
        args: "0x",
        code_hash:
          "0x481e019212aabec00cc8f4ff1f05b20f81c1d7a1450a07d88bb7873bb94c72f6",
        hash_type: "data",
      },
    },
    {
      // output cell 2
      capacity: "0x" + remain_money.toString(16),
      lock: {
        code_hash:
          "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        args: "0x43d509d97f26007a285f39241cffcd411157196c",
        hash_type: "type",
      },
    },
  ];
  raw_tx.cell_deps = cell_deps;
  raw_tx.inputs.push(input);
  raw_tx.outputs = outputs;
  raw_tx.outputs_data = ["0x" + Buffer.from("cariot123").toString("hex"), "0x"];

  const tx = await builder.sign_P2PKH(raw_tx, witnessArgs, input_cells);
  const tx_hash = await builder.send_tx(tx);
  console.log(tx_hash);
}

test_contract();

//test();

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
