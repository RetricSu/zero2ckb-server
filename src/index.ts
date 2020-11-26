require("dotenv").config();
import path from "path";
import { initializeConfig, getConfig } from "@ckb-lumos/config-manager";
import {
  Indexer,
  CellCollector,
  TransactionCollector,
} from "@ckb-lumos/indexer";
import {
  generateAddress,
  parseAddress,
  createTransactionFromSkeleton,
  sealTransaction,
  TransactionSkeleton,
} from "@ckb-lumos/helpers";
import { MultisigScript, secp256k1Blake160Multisig ,secp256k1Blake160, dao } from "@ckb-lumos/common-scripts";
import type { Script, Transaction } from "@ckb-lumos/base/index";
import TransactionManager from "@ckb-lumos/transaction-manager";
import user from "./user.json";
import { RPC } from "ckb-js-toolkit";
import { key, Keystore } from "@ckb-lumos/hd";

if (process.env.LUMOS_CONFIG_FILE) {
  process.env.LUMOS_CONFIG_FILE = path.resolve(process.env.LUMOS_CONFIG_FILE);
}
initializeConfig();
getConfig();

const indexer = new Indexer("http://127.0.0.1:8114", "./indexed-data");
indexer.startForever();

const transactionManager = new TransactionManager(indexer);
transactionManager.start();

const rpc = new RPC("http://127.0.0.1:8114");

async function get_tip() {
  const t = await indexer.tip();
  //console.log(t);
}

get_tip();

const script: Script = {
  code_hash:
    "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
  hash_type: "type",
  args: user.account[0].lock_arg,
};

const script2: Script = {
  code_hash:
    "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
  hash_type: "type",
  args: '0xb33248c08c55ed636d2f00d065d223ec1a0d333a',
}

const script3: Script = {
  code_hash:
    "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
  hash_type: "type",
  args: '0x952809177232d0dba355ba5b6f4eaca39cc57746'
}

const address = generateAddress(script);
const address2 = generateAddress(script2);
const address3 = generateAddress(script3);

// Now let's create the actual skeleton, and deposit CKBytes into the skeleton
let skeleton = TransactionSkeleton({ cellProvider: indexer });
//console.log(JSON.stringify(skeleton));


const test_cell = async function(){
  const cellCollector = new CellCollector(indexer, {
    lock: script3,
  });
  
  for await (const cell of cellCollector.collect()) {
    console.log(cell);
  }
};

test_cell();

const get_public_key_hash = function(){
  return [
    user.account[0].lock_arg,
    '0x952809177232d0dba355ba5b6f4eaca39cc57746',
    '0xb33248c08c55ed636d2f00d065d223ec1a0d333a'
  ]
}

// #deposit
const deposit = async function (amount: bigint, tx_fee: bigint) {
  //skeleton = await dao.deposit(skeleton, address, address, amount);
  //skeleton = await secp256k1Blake160.transfer(skeleton, address, address2, amount);

  const pubkeyhashes = get_public_key_hash();
  const frominfo: MultisigScript = {
    R: 1,
    M: 2,
    publicKeyHashes: pubkeyhashes
  }
  skeleton = await secp256k1Blake160Multisig.transfer(skeleton, frominfo, address2, amount);
  //skeleton = await secp256k1Blake160.payFee(skeleton, address, tx_fee);
  console.log(JSON.stringify(createTransactionFromSkeleton(skeleton)));
  skeleton = secp256k1Blake160Multisig.prepareSigningEntries(skeleton);
  const signingEntries = skeleton.get("signingEntries").toArray();
  console.log(signingEntries);
  
  const signatures = [
    "0xf05e152f0dd636c8ae96a4c23dfe1e9b846179d1594e1d8da8e3b32f2e07fbb872f2e92de1e831c509c535548c0d292482444f9d343dafacc8b19cadd7c3687901",
    "0x8372428f746473b9cb1b9e20337ff48defeca418386fc5c6ad085550701c37c572620f4f29d62895ffc9fe3b4f1810057cd105cbd4330d82b195cf8590f6aace01",
    "0x6c02ca7e235215bed94907dba1b0841d1f05385cd0fe2a2b6eb392549092ec7107a8c5c5abbf35e52fe851f1998eb475e01efa9925d98b1c91e2ca10e265959201"
  ]
  const tx = sealTransaction(skeleton, signatures);
  console.log(JSON.stringify(tx));
  

  // run ckb-cli to create signature.
  //      ckb-cli util sign-message --output-format json --privkey-path wallet --message 0x3ebdc6fd05c11bb46af7501239baf9cec09a4e08e18d938532ae224b98f6f57e
  // and seal the complete transaction.
  /*
  const signatures = [
    "0x762419130bbbfaea5de585e1807c77f03b6452636313ecb805b58b13bb6a5ab57f986403e2541c04475cbdb54aa12d39ab3147a372e29df22cbbf415847c405600",
  ];
  const tx = sealTransaction(skeleton, signatures);
  
  console.log("######## tx ############");
  console.log(JSON.stringify(tx));
  console.log(createTransactionFromSkeleton(skeleton));
  console.log("####################");
  */
  //const collector = transactionManager.collector({"lock":script});
  //for await (const cell of collector.collect()) {
  //  console.log('uncommit cell: ')
  //  console.log(cell)
  //}

  // now you send transaction via `transactionManager`.
  //const txHash = await transactionManager.send_transaction(tx);
  //const txHash = await rpc.send_transaction(tx);
  //console.log(txHash);
};

deposit(99900000000n, 100000000n);

async function test() {
  const t: Transaction = {
    version: "0x0",
    cell_deps: [
      {
        out_point: { //dao
          tx_hash:
            "0xa563884b3686078ec7e7677a5f86449b15cf2693f3c1241766c6996f206cc541",
          index: "0x2",
        },
        dep_type: "code",
      },
      {
        out_point: { //SECP256K1_BLAKE160
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
            "0x28419d89688471aa3a4b080879b44db71122c370b591a69c1c51d8180fe4dabd",
          index: "0x0",
        },
      },
    ],
    outputs: [
      { 
        capacity: "0x174876e800",
        lock: {
          code_hash:
            "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
          hash_type: "type",
          args: "0x43d509d97f26007a285f39241cffcd411157196c",
        },
        type: {
          code_hash:
            "0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e",
          hash_type: "type",
          args: "0x",
        },
      },
      {
        capacity: "0x12305185523f",
        lock: {
          code_hash:
            "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
          hash_type: "type",
          args: "0x43d509d97f26007a285f39241cffcd411157196c",
        },
      },
    ],
    outputs_data: ["0x0000000000000000", "0x"],
    witnesses: [
      "0x5400000010000000540000005400000040000000762419130bbbfaea5de585e1807c77f03b6452636313ecb805b58b13bb6a5ab57f986403e2541c04475cbdb54aa12d39ab3147a372e29df22cbbf415847c4056",
    ],
  };
  
  //const txHash = await transactionManager.send_transaction(t);
  const txHash = await rpc.send_transaction(t);
  console.log(txHash);
}
//test();

async function simple_transfer(){
    const basic_tx = {
        version: "0x0",
        cell_deps: [
          {
            out_point: { //SECP256K1_BLAKE160
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
                "0x28419d89688471aa3a4b080879b44db71122c370b591a69c1c51d8180fe4dabd",
              index: "0x0",
            },
          },
        ],
        outputs: [
          { 
            capacity: "0x174876e800",
            lock: {
              code_hash:
                "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
              hash_type: "type",
              args: "0x43d509d97f26007a285f39241cffcd411157196c",
            }
          },
          {
            capacity: "0x12305185523f",
            lock: {
              code_hash:
                "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
              hash_type: "type",
              args: "0xb33248c08c55ed636d2f00d065d223ec1a0d333a",
            },
          },
        ],
        outputs_data: ["0x", "0x"]
    };

    console.log(JSON.stringify(basic_tx));
    const t: Transaction = {
        version: "0x0",
        cell_deps: [
          {
            out_point: { //SECP256K1_BLAKE160
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
                "0x28419d89688471aa3a4b080879b44db71122c370b591a69c1c51d8180fe4dabd",
              index: "0x0",
            },
          },
        ],
        outputs: [
          { 
            capacity: "0x174876e800",
            lock: {
              code_hash:
                "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
              hash_type: "type",
              args: "0x43d509d97f26007a285f39241cffcd411157196c",
            }
          },
          {
            capacity: "0x12305185523f",
            lock: {
              code_hash:
                "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
              hash_type: "type",
              args: "0xb33248c08c55ed636d2f00d065d223ec1a0d333a",
            },
          },
        ],
        outputs_data: ["0x", "0x"],
        witnesses: [
          "0x22299343ad234a3b82ee7face62e8ce4af869282a9238f739a7d1195efade8b11dd6a7568ea512cc4ffc3c7bb803557d0c7e2f6cfdc809f54942d6b5a3e1a5b1",
        ],
    };

    //const txHash = await transactionManager.send_transaction(t);
    const txHash = await rpc.send_transaction(t);
    console.log(txHash);
}

//simple_transfer()