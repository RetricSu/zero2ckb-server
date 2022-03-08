import { MultisigScript, Cell, Builder } from "../lib/builder";
import chainConfig from "../config/lumos-config.json";
import { Script, RawTransaction } from "@ckb-lumos/base";
import { envConfig } from "../lib/env-config";
const config =
  envConfig.mode === "development"
    ? chainConfig.development
    : chainConfig.production;

const builder = new Builder();

const multisigAddress = {
  "lock-arg": "0x9aa78d1ced9e5cd997c596e8a9877e32097c621f",
  "lock-hash":
    "0xcb0943365ded0db0888f43db2a3bd8aabfe4b68f6214336653d196a08d8b849b",
  mainnet: "ckb1qyqe4fudrnkeuhxejlzed69fsalryztuvg0sq95l70",
  testnet: "ckt1qyqe4fudrnkeuhxejlzed69fsalryztuvg0saq2qjn",
};

const multisigLock: Script = {
  code_hash: config.SCRIPTS.SECP256K1_BLAKE160_MULTISIG.CODE_HASH,
  hash_type:
    config.SCRIPTS.SECP256K1_BLAKE160_MULTISIG.HASH_TYPE == "type"
      ? "type"
      : "data",
  args: multisigAddress["lock-arg"],
};

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
  ],
  header_deps: [],
  inputs: [
    {
      since: "0x0",
      previous_output: {
        tx_hash:
          "0x7614683fa3dd495c7a99196961e3e84b387dc48e7afbd8b907cd5e785c762f50",
        index: "0x0",
      },
    },
  ],
  outputs: [
    {
      capacity: "0x174876e800",
      lock: multisigLock,
    },
    {
      capacity: "0x12304fddecdc",
      lock: {
        code_hash:
          "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        hash_type: "type",
        args: "0x43d509d97f26007a285f39241cffcd411157196c",
      },
    },
  ],
  outputs_data: ["0x", "0x"],
};

const witnessArgs = [
  {
    lock: "0x",
  },
];

const inputcells: Cell[] = [
  {
    capacity: "0x12479e4ab5dc",
    lock: {
      args: "0x43d509d97f26007a285f39241cffcd411157196c",
      code_hash:
        "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
      hash_type: "type",
    },
    data: "0x",
    out_point: {
      tx_hash:
        "0x7614683fa3dd495c7a99196961e3e84b387dc48e7afbd8b907cd5e785c762f50",
      index: "0x0",
    },
  },
];

async function start() {
  const tx = await builder.sign_P2PKH(raw_tx, witnessArgs, inputcells);
  console.log(tx);
}

async function send() {
  const tx = await builder.sign_P2PKH(raw_tx, witnessArgs, inputcells);
  console.log(JSON.stringify(tx));
  const txhash = await builder.send_tx(tx);
  console.log(txhash);
}

const get_public_key_hash = function () {
  return [
    "0x43d509d97f26007a285f39241cffcd411157196c",
    "0x952809177232d0dba355ba5b6f4eaca39cc57746",
    "0xb33248c08c55ed636d2f00d065d223ec1a0d333a",
  ];
};

async function test() {
  const raw_tx: RawTransaction = {
    version: "0x0",
    cell_deps: [
      {
        out_point: {
          tx_hash:
            "0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708",
          index: "0x1",
        },
        dep_type: "dep_group",
      },
    ],
    header_deps: [],
    inputs: [
      {
        since: "0x0",
        previous_output: {
          tx_hash:
            "0xff0333df08cc41a1c1d6a749583b35ce3bb6c2865f56f3996e6fc9a2aec6ccc5",
          index: "0x0",
        },
      },
    ],
    outputs: [
      {
        capacity: "0x1742810700",
        lock: {
          code_hash:
            "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
          hash_type: "type",
          args: "0xb33248c08c55ed636d2f00d065d223ec1a0d333a",
        },
      },
    ],
    outputs_data: ["0x"],
  };
  const multisigScript: MultisigScript = {
    S: 0,
    R: 1,
    M: 2,
    N: 3,
    publicKeyHashes: get_public_key_hash(),
  };
  const witnessArgs = [
    {
      lock: "0x",
    },
  ];
  const inputcells: Cell[] = [
    {
      capacity: "0x174876e800",
      lock: {
        code_hash:
          "0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8",
        hash_type: "type",
        args: "0x9aa78d1ced9e5cd997c596e8a9877e32097c621f",
      },
      data: "0x",
      out_point: {
        tx_hash:
          "0xff0333df08cc41a1c1d6a749583b35ce3bb6c2865f56f3996e6fc9a2aec6ccc5",
        index: "0x0",
      },
    },
  ];
  const account_ids = [0, 2];
  const tx = builder.sign_Multisig(
    raw_tx,
    multisigScript,
    witnessArgs,
    inputcells,
    account_ids
  );
  console.log(JSON.stringify(tx));
  const txhash = await builder.send_tx(tx);
  console.log(txhash);
}

test();

/*
const correct_Tx = {
  cell_deps:
    - dep_type: dep_group
      out_point:
        index: 1
        tx_hash: 0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708
  hash: 0xbfc4be0e56a2e0f4761a446a3032dc7532238276db17c7f588927273871489f5
  header_deps: []
  inputs:
    - previous_output:
        index: 0
        tx_hash: 0xff0333df08cc41a1c1d6a749583b35ce3bb6c2865f56f3996e6fc9a2aec6ccc5
      since: 0x0 (absolute block(0))
  outputs:
    - capacity: "999.0"
      lock:
        args: 0xb33248c08c55ed636d2f00d065d223ec1a0d333a
        code_hash: 0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8 (sighash)
        hash_type: type
      type: ~
  outputs_data:
    - 0x
  version: 0
  witnesses:
    - 0xd600000010000000d6000000d6000000c20000000001020343d509d97f26007a285f39241cffcd411157196c952809177232d0dba355ba5b6f4eaca39cc57746b33248c08c55ed636d2f00d065d223ec1a0d333a
      6c02ca7e235215bed94907dba1b0841d1f05385cd0fe2a2b6eb392549092ec7107a8c5c5abbf35e52fe851f1998eb475e01efa9925d98b1c91e2ca10e265959201
      f05e152f0dd636c8ae96a4c23dfe1e9b846179d1594e1d8da8e3b32f2e07fbb872f2e92de1e831c509c535548c0d292482444f9d343dafacc8b19cadd7c3687901
tx_status:
  block_hash: 0xa23ce73d7a2ad471411b5260654123307df8ca2a7d10290d5f635afa3027eb83
  status: committed
}*/
