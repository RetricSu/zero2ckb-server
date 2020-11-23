// ref: https://github.com/nervosnetwork/ckb-system-scripts/wiki/How-to-sign-transaction

// sign a P2PH tx
import { validators, normalizers, transformers, Reader } from "ckb-js-toolkit";
import {
  SerializeTransaction,
  SerializeWitnessArgs,
} from "@ckb-lumos/types/lib/core";
import { RPC } from "ckb-js-toolkit";
import {
  core,
  values,
  utils,
  CellDep,
  Script,
  Address,
  HexString,
} from "@ckb-lumos/base";
const { CKBHasher, ckbHash } = utils;

function serializeBigInt(i: number) {
  const view = new DataView(new ArrayBuffer(8));
  view.setUint32(0, i, true);
  return view.buffer;
}

export function hashWitness(hasher: any, witness: HexString): void {
  const lengthBuffer = new ArrayBuffer(8);
  const view = new DataView(lengthBuffer);
  view.setBigUint64(0, BigInt(new Reader(witness).length()), true);
  hasher.update(lengthBuffer);
  hasher.update(witness);
}

const generate_message_to_sign = function (
  tx_hash: HexString,
  length: ArrayBuffer,
  witness: Reader
): HexString {
  const hasher = new CKBHasher();
  hasher.update(tx_hash);
  hasher.update(length);
  hasher.update(witness);
  return hasher.digestHex();
};

const sign_test = async function () {
  const rpc = new RPC("http://127.0.0.1:8114");
  const raw_tx = {
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
            "0x92d95ca6e1b0bf8ad605739c8e18c4c28c8a4ea789877e5df39271cbe8292c18",
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
          args: "0xb33248c08c55ed636d2f00d065d223ec1a0d333a",
        },
      },
      {
        capacity: "0x92f13699b9e",
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
  var default_witness = [
    {
      lock: "0x" + "0".repeat(130),
      input_type: "",
      output_type: "",
    },
  ];
  const witness = [
    new Reader(
      SerializeWitnessArgs(normalizers.NormalizeWitnessArgs(default_witness[0]))
    ).serializeJson(),
  ];
  var tx = {
    ...raw_tx,
    ...{
      witnesses: witness,
    },
  };

  const txHash = ckbHash(
    core.SerializeRawTransaction(normalizers.NormalizeRawTransaction(raw_tx))
  ).serializeJson();
  const firstWitness = new Reader(tx.witnesses[0]);
  const length = serializeBigInt(firstWitness.length());

  const message = generate_message_to_sign(txHash, length, firstWitness);
  console.log(message);
  
  const signatures = [
    "0xcc226e9d219663d7856eb6d02ea258b89a8e844a1685570406eeefbdbf9fb32901b117c735e80614308e4233e6b0a9ff97dac2a0764f41d3a7d42059576d091200",
  ];

  tx.witnesses[0] = new Reader(
    SerializeWitnessArgs(
      normalizers.NormalizeWitnessArgs({
        ...default_witness[0],
        lock: signatures[0],
      })
    )
  ).serializeJson();
  //tx.witnesses = signatures;
  console.log(JSON.stringify(tx));
  const real_txHash = await rpc.send_transaction(tx);
  console.log(txHash === real_txHash);
};

sign_test();

