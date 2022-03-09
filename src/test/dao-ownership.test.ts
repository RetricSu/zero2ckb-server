import { MultisigScript, Cell, Builder } from "../lib/builder";
import {
  Input,
  Output,
  CellDep,
  Script,
  WitnessArgs,
  RawTransaction,
} from "@ckb-lumos/base";
import { Chain } from "../lib/chain";

const chain = new Chain();
const builder = new Builder();

// deploy nervos-dao-ownership contract
async function deploy() {
  const { length, code } = builder.readContractCodeByFileName(
    "nervos-dao-extended-ownership-script"
  );

  var raw_tx: RawTransaction = {
    version: "0x0",
    header_deps: [],
    cell_deps: [
      {
        out_point: {
          tx_hash:
            "0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708",
          index: "0x0",
        },
        dep_type: "dep_group",
      },
    ],
    inputs: [
      {
        previous_output: {
          tx_hash:
            "0x8f2a10a44d803308a09839a5d576c335298a03db0db0421ac2394f85d9a98580",
          index: "0x0",
        },
        since: "0x0",
      },
    ],
    outputs: [
      {
        capacity: "0x12479c398051",
        lock: {
          code_hash:
            "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
          hash_type: "type",
          args: "",
        },
      },
    ],
    outputs_data: ["0x"],
  };

  const outpoints = raw_tx.inputs.map((input) => input.previous_output);
  var input_cells: Cell[] = [];
  try {
    input_cells = await chain.getInputCellsByOutpoints(outpoints);
    const tx = builder.deploy_contract(
      code,
      length,
      raw_tx,
      input_cells,
      "normal"
    );
    console.log(tx);
    const tx_hash = await builder.send_tx(tx);
    console.log(tx_hash);
    // 0x4be49e25f35d2bb0a13063da64ca8e53bf9459ed17c68e624bc0755326744c3e
    // new-version: 0x5accdd6ebc0cc8dc80f22f7488a78854ed8646b3006a7a75414f1656962cb242
    // debug-version: 0x05ba0204a962743af21a038cb5ba30b4a41839b9a240b81becfea6dcb3b8fdd1
  } catch (error) {
    console.log(error);
  }
}

async function deploy_as_script() {
  const { length, code } = builder.readContractCodeByFileName("always_success");

  var raw_tx: RawTransaction = {
    version: "0x0",
    header_deps: [],
    cell_deps: [
      {
        out_point: {
          tx_hash:
            "0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708",
          index: "0x0",
        },
        dep_type: "dep_group",
      },
    ],
    inputs: [
      {
        previous_output: {
          tx_hash:
            "0x27d03b81c4a4f664d1543f53b3fdfc8b7b94af58587b9805066191e364882bd3",
          index: "0x0",
        },
        since: "0x0",
      },
    ],
    outputs: [
      {
        capacity: "0x12479b65d428",
        lock: {
          code_hash:
            "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
          hash_type: "type",
          args: "",
        },
      },
    ],
    outputs_data: ["0x"],
  };

  const outpoints = raw_tx.inputs.map((input) => input.previous_output);
  var input_cells: Cell[] = [];
  try {
    input_cells = await chain.getInputCellsByOutpoints(outpoints);
    const tx = builder.deploy_contract(
      code,
      length,
      raw_tx,
      input_cells,
      "normal"
    );
    console.log(tx);
    const tx_hash = await builder.send_tx(tx);
    console.log(tx_hash);
    // 0x5c982b1dc9dc2a9be61e25ae39e5bf468afae35c52dc2a49fcebd9920d5d3e63
    // code_hash: 0x5840173fd799271322725e6543c56d19ddec9f9d21a7af9d635c5fe18b1b6277'
  } catch (error) {
    console.log(error);
  }
}

//deploy_as_script()

// deploy type-id contract
async function deploy_type_id() {
  const { length, code } = builder.readContractCodeByFileName("type_id");

  var raw_tx: RawTransaction = {
    version: "0x0",
    header_deps: [],
    cell_deps: [
      {
        out_point: {
          tx_hash:
            "0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708",
          index: "0x0",
        },
        dep_type: "dep_group",
      },
    ],
    inputs: [
      {
        previous_output: {
          tx_hash:
            "0x769d95f4bd3e7f9e7e866270c1a5a1e3a13dd617d43cfcec30056d99a3b04b3d",
          index: "0x0",
        },
        since: "0x0",
      },
    ],
    outputs: [],
    outputs_data: [],
  };

  const outpoints = raw_tx.inputs.map((input) => input.previous_output);
  var input_cells: Cell[] = [];
  try {
    input_cells = await chain.getInputCellsByOutpoints(outpoints);
    const tx = builder.deploy_contract(
      code,
      length,
      raw_tx,
      input_cells,
      "normal"
    );
    console.log(tx);
    const tx_hash = await builder.send_tx(tx);
    console.log(`deploy type-id contract, tx_hash: ${tx_hash}`);
    // 0x636711bd7e765917853ab7c070278e7cec6ad34613a07347030e41463e7478e0
  } catch (error) {
    console.log(error);
  }
}

// deploy_type_id();

// deploy();

async function produce_type_id_cell() {
  const type_id_args = builder.generateTypeIDArgs({
    previous_output: {
      tx_hash:
        "0x0dda7f601ea1e89c81e7536f8b4b75bae40872e112eb66699a147a7eec351900",
      index: "0x0",
    },
    since: "0x0",
  });
  console.log(type_id_args);
}

//produce_type_id_cell();
async function get_type_hash() {
  const type: Script = {
    args: "0x00000000000000005af0c7b59c78268173cbca467fa90ab62804ceabda923562d17065a891ff03aa00000000",
    code_hash:
      "0x733cc63612c025dd72a417d721a7f102c96d422586ac894975ce0f23b2a81258",
    hash_type: "data",
  };
  const test_type: Script = {
    code_hash:
      "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    hash_type: "type",
    args: "0x43d509d97f26007a285f39241cffcd411157196c",
  };
  const always_success_with_type: Script = {
    code_hash:
      "0x733cc63612c025dd72a417d721a7f102c96d422586ac894975ce0f23b2a81258",
    hash_type: "data",
    args: "0x00000000000000000dda7f601ea1e89c81e7536f8b4b75bae40872e112eb66699a147a7eec35190000000000",
  };
  return builder.generateScriptHash(always_success_with_type);
}

async function get_code_hash() {
  const contract = builder.readContractCodeByFileName(
    "nervos-dao-extended-ownership-script"
  );
  return builder.generateCodeHash(contract.code);
}

// use the on-chain dao-ownership contract.
async function use_contract() {
  // always_success contract:
  //     tx_hash: 0x5c982b1dc9dc2a9be61e25ae39e5bf468afae35c52dc2a49fcebd9920d5d3e63
  //     code_hash: 0x5840173fd799271322725e6543c56d19ddec9f9d21a7af9d635c5fe18b1b6277

  // type-id contract:
  //   tx_hash: 0x636711bd7e765917853ab7c070278e7cec6ad34613a07347030e41463e7478e0

  // dao-ownership contract:
  //   tx_hash: 0x4be49e25f35d2bb0a13063da64ca8e53bf9459ed17c68e624bc0755326744c3e
  //   code_hash:  0x8fc1dc5d3a2c53c8f80e3c32c01b792af0c8efaf99cb1ec79abf0ce2b3aee7bd
  // new-version:
  //   tx_hash: 0x5accdd6ebc0cc8dc80f22f7488a78854ed8646b3006a7a75414f1656962cb242
  //   code_hash: 0xd32b3b94d626fe79153dbdf8b5bd8759f53dff873f9cec3a891bcd4b48514d4e
  // debug-version:
  //   tx_hash: 0x89f52f419cb8f09abd3e4206712b8068df0aa68eae41dcf277db5ebde09d97b4
  //   code_hash: 0xc8c4ed4cce5fd45f92f02868e8c502e83b1638f24064612fc79974d791443a69
  // capsule-version:
  //   tx_hash: 0x5ad129a46fc57545bb0b1f60ad069aee4cc20f1e3b7ebc6b618b0437dcbc5382
  //   code_hash: 0xbec097c439908161183e6dc25112aa70c5a6a52a0e0b1482c04ce046d772be65
  //   dep-group:
  //   tx_hash: 0x75215caaee301ce24ec5d17c61a700ab05af2270a95d03d41e7a140b91b535c9
  //   dep_type: dep_group
  // -----------------------------------------

  // puppet_cell:
  //   tx_hash: 0x69116973868a70807cc92a9ebfe9e0127a35fa35296f41af9ea4e3d582e22b18
  //   type_hash: 0x6f61d967970d66c9c46b0a4423d171f9f2341b37b389f61b3e6906063bfcbdae

  // puppet-cell-with-always-success:
  //   tx_hash:  0x511337d7846fed4883d44407af472a46e4be6b34214dc1f3d1bccc45a55f2d84
  //   type_hash: 0x0d47a76b9516d2c2a60646f8bda17e0697419f8c5b9b732babe4ed3d4aca5ecc

  // dao_cell:
  //   tx_hash: 0x00a95e08ee4d9506bba19fbf20830a13b6f94c06337921ecdbba84d1235cbba2
  // new-version:
  //   tx_hash: 0x776c95ad59d0f858644fa45a71ca61bb5890a8dda699d444b46702d1887c3423
  // dao_cell_with_always_success_puppet:
  //   tx_hash: 0xe61ba53926b1c54ade00269355d30ba45fd98bbad6abec60df2dc7e7bf0152da
  // debug-version:
  //   tx_hash: 0xac69f9e8997b7d4a4b9683bd6144582ec3402fb139b0f1e4a9b63034c675f8cf
  // capsule-version:
  //   tx_hash: 0xcbca60bcc78a32b3bbfb0a40c6c8190ee0edcebfbfb5368be68a7042cb87fde2

  // let's create a
  var raw_tx: RawTransaction = {
    version: "0x0",
    cell_deps: [
      {
        out_point: {
          tx_hash:
            "0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708",
          index: "0x0",
        },
        dep_type: "dep_group",
      },
      {
        out_point: {
          tx_hash:
            "0x4be49e25f35d2bb0a13063da64ca8e53bf9459ed17c68e624bc0755326744c3e",
          index: "0x0",
        },
        dep_type: "code",
      },
    ],
    header_deps: [],
    inputs: [
      {
        since: "0x0",
        previous_output: {
          tx_hash:
            "0x9353ba318c466db2139b0cd8813af8cf43f6ea15ae31a2c165486daf00f14c3b",
          index: "0x0",
        },
      },
      {
        since: "0x0",
        previous_output: {
          tx_hash:
            "0x48b4a5aefaa3e717ddb8fbeb639fd09a2823ae23d8829e0335b79487ae8fe83b",
          index: "0x0",
        },
      },
    ],
    outputs: [
      {
        capacity: "0x124591504400",
        lock: {
          code_hash:
            "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
          hash_type: "type",
          args: "0x952809177232d0dba355ba5b6f4eaca39cc57746",
        },
      },
    ],
    outputs_data: ["0x"],
  };
  const tx_hash =
    "0x683ee8bbe80419f2b1d4dbf3456a0155d60656ba98f1b5ee9182d7bc7487020f";
  const outpoints = raw_tx.inputs.map((input) => input.previous_output);
  var input_cells: Cell[] = [];
  try {
    input_cells = await chain.getInputCellsByOutpoints(outpoints);
    const signature = builder.signMessageByAccountId(tx_hash, 0);
    const witness = builder.serializeWitness({ lock: signature });
    console.log(witness);
    // 0x5500000010000000550000005500000041000000cbcb0e8a971424860563e5a7560567b6aaf446d2c3808edcdf870f6c7a825c711e79c67a3767571f728be866ae06d1b4451f83d8d52994f3da26b13bbb9e454000
  } catch (error) {
    console.log(error);
  }
}

//use_contract()

function sign_msg() {
  const msg =
    "0xabd6f2deb58fb9da65d51fe80e2b6a793f199dad1c57483568e66ec5b384758e";
  const signature = builder.signMessageByAccountId(msg, 0);
  const witness = builder.serializeWitness({ lock: signature });
  console.log(witness);
  console.log((signature.length - 2) / 2);
}

async function test_contract() {
  const raw_tx: RawTransaction = builder.generateRawTxTemplate();

  const whole_money = 20098662182385n;
  const tx_fee = 100000000n;
  const output_money = whole_money - tx_fee - BigInt(61 + 10) * 100000000n;
  const remain_money = whole_money - output_money - tx_fee;

  const input: Input = {
    previous_output: {
      tx_hash:
        "0xda10c8b1fd3c68f46279acb546524fca7e253b41acf3373769e13f070772bcb4",
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
          "0xda10c8b1fd3c68f46279acb546524fca7e253b41acf3373769e13f070772bcb4",
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
        // the new contract contained upgradable parrot code
        tx_hash:
          "0xbd01ff34d078f3881d60076baa550b495d81706e94839190d7e3cf3b5838f54d",
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
          "0x83ff58dd574613f51098835b5d5578a211eacdbf78fbc32263bccc91370a02a5",
        hash_type: "type",
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
  raw_tx.outputs_data = ["0x" + Buffer.from("carrot123").toString("hex"), "0x"];

  const tx = await builder.sign_P2PKH(raw_tx, witnessArgs, input_cells);
  const tx_hash = await builder.send_tx(tx);
  console.log(tx_hash);
}

// console.log(get_type_hash());
// console.log(get_code_hash());
sign_msg();
//deploy();
