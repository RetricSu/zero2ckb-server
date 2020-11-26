/**
 * 
    _    ____ ____ ____ _  _    ____ _  _ ___     ___  _   _    _  _ ____ _  _ ___  
    |    |___ |__| |__/ |\ |    |    |_/  |__]    |__]  \_/     |__| |__| |\ | |  \ 
    |___ |___ |  | |  \ | \|    |___ | \_ |__]    |__]   |      |  | |  | | \| |__/ 
 * 
 * The popurse of this code is to help developers gain a better understanding
 * about how CKB works by allowing them construct a raw transaction purely by their
 * hands and then serializes the tx and uplpad to blockchain. To learn more about the 
 * whole life cycle of how Transaction got processed in CKB, compares to Bitcoin and 
 * Ethereum, don't forget to check out the following links.
 * 
 * - https://docs.nervos.org/docs/essays/rules
 * - https://github.com/nervosnetwork/ckb-system-scripts/wiki/How-to-sign-transaction
 * - https://docs.ckb.dev/docs/rfcs/0022-transaction-structure/0022-transaction-structure#transaction-hash
 * 
 * ## pre-reqiured
 * 
 * - generate a couple brand new wallet accounts using the command tool ckb-cli
 * - run a CKB devnet on local.
 * - pass the wallets info to /src/user.json. (including password, so !!!do NOT use this wallet in production!!!)
 * 
 * ## useage example 
 *      
        import { Builder } from "./builder";

        // construct the following args 
        // purely by your hand and your mind.

        const raw_tx: RawTransaction;
        const witness_args: WitnessArgs[];
        const input_cells: Cell[];

        // pass the three args above to builder 
        // to generate a real transaction
        // and even to send it out to blockchain!(by RPC)

        const builder = new Builder();
        const tx = builder.sign_P2PKH(raw_tx, witness_args, input_cells);
        const txhash = await builder.send_tx(tx);
        console.log(txhash);
 */
import path from "path";
import fs from "fs";
import * as Config from "../dev_cofig.json";
import * as CONST from "../const.json";
import { RPC, validators, normalizers, transformers, Reader } from "ckb-js-toolkit";
import {
  core,
  utils,
  Script,
  WitnessArgs,
  OutPoint,
  HexString,
  Transaction,
  RawTransaction,
} from "@ckb-lumos/base";
import { key, Keystore } from "@ckb-lumos/hd";
import * as user from "../user.json";
import { serializeBigInt, toBigUInt64LE } from "./helper";


const { CKBHasher, ckbHash } = utils;

export interface Message {
  index: number;
  message: HexString;
  lock: Script;
}

export interface Cell {
  capacity: HexString;
  lock: Script;
  type?: Script;
  data: HexString;
  out_point: OutPoint;
}

export interface InputsGroup {
  hash: string;
  child: number[];
}

export interface MultisigScript {
  S: number;
  R: number;
  M: number;
  N: number;
  publicKeyHashes: string[];
}

export type ContractMode = "normal" | "test" | "upgradable";

export class Builder {
  private hasher;

  constructor() {
    this.hasher = new CKBHasher();
  }

  sign_P2PKH(
    raw_tx: RawTransaction,
    witnessArgs: WitnessArgs[],
    inputCells: Cell[],
    account_id = 0
  ): Transaction {
    const messages: Message[] = [];
    const signedWitness: HexString[] = [];

    // 0. group the input with same lock script for witness
    const input_groups = this.groupInputs(inputCells);

    for (let i = 0; i < input_groups.length; i++) {
      const group_index = input_groups[i].child[0];

      //reserve dummy lock for the first witness
      const dummy_lock = "0x" + "0".repeat(130);
      let witness_args = witnessArgs[group_index];
      witness_args.lock = dummy_lock;

      this.hasher = new CKBHasher();

      // 1. hash the txHash
      const tx_hash = this.generateTxHash(raw_tx);
      this.hasher.update(tx_hash);

      // 2. hash the witness in groups order.
      // - 2.1 hash the first witness in group
      const firstWitness = new Reader(this.serializeWitness(witness_args));
      this.hasher.update(serializeBigInt(firstWitness.length()));
      this.hasher.update(firstWitness);
      // - 2.2 hash the rest of witness in the same group
      for (let j = 1; j < input_groups[i].child.length; j++) {
        const witness_index = input_groups[i].child[j];
        let witness_args_in_group = witnessArgs[witness_index];
        const witeness_in_group = new Reader(
          this.serializeWitness(witness_args_in_group)
        );
        this.hasher.update(serializeBigInt(witeness_in_group.length()));
        this.hasher.update(witeness_in_group);
      }
      // - 2.3 hash the witness which do not in any input group
      for (let k = raw_tx.inputs.length; k < witnessArgs.length; k++) {
        let witness_args_alone = witnessArgs[k];
        const witeness_alone = new Reader(
          this.serializeWitness(witness_args_alone)
        );
        this.hasher.update(serializeBigInt(witeness_alone.length()));
        this.hasher.update(witeness_alone);
      }

      // 3. generate the sign-message, ready to be signed.
      const sig_hash = this.hasher.digestHex();
      messages.push({
        index: i,
        message: sig_hash, // hex string
        lock: inputCells[i].lock,
      });

      // 4. sign tx
      const signature = this.signMessage(sig_hash, account_id = account_id);

      // 5. put the signature back to the first witness of the group.
      witness_args.lock = signature;
      signedWitness[group_index] = this.serializeWitness(witness_args);
    }
    // 6. return the complete tx which can be uploaded on-chain directly through rpc.
    return { ...raw_tx, ...{ witnesses: signedWitness } };
  }

  sign_Multisig(
    raw_tx: RawTransaction,
    multisigScript: MultisigScript,
    witnessArgs: WitnessArgs[],
    inputCells: Cell[],
    account_ids: number[]
  ){
    /** to do */
    const messages: Message[] = [];
    const signedWitness: HexString[] = [];

    const M = multisigScript.M;

    // 0. group the input with same lock script for witness
    const input_groups = this.groupInputs(inputCells);

    for (let i = 0; i < input_groups.length; i++) {
      const group_index = input_groups[i].child[0];

      const serializedMultisigScript = this.serializeMultisigScript(multisigScript);
      //const multisigScriptHash = this.generateMultisigScriptHash(serializedMultisigScript);
      const dummy_lock = serializedMultisigScript + "0".repeat(130 * M);
      let witness_args = witnessArgs[group_index];
      witness_args.lock = dummy_lock;

      this.hasher = new CKBHasher();

      // 1. hash the txHash
      const tx_hash = this.generateTxHash(raw_tx);
      this.hasher.update(tx_hash);

      // 2. hash the witness in groups order.
      // - 2.1 hash the first witness in group
      const firstWitness = new Reader(this.serializeWitness(witness_args));
      this.hasher.update(serializeBigInt(firstWitness.length()));
      this.hasher.update(firstWitness);
      // - 2.2 hash the rest of witness in the same group
      for (let j = 1; j < input_groups[i].child.length; j++) {
        const witness_index = input_groups[i].child[j];
        let witness_args_in_group = witnessArgs[witness_index];
        const witeness_in_group = new Reader(
          this.serializeWitness(witness_args_in_group)
        );
        this.hasher.update(serializeBigInt(witeness_in_group.length()));
        this.hasher.update(witeness_in_group);
      }
      // - 2.3 hash the witness which do not in any input group
      for (let k = raw_tx.inputs.length; k < witnessArgs.length; k++) {
        let witness_args_alone = witnessArgs[k];
        const witeness_alone = new Reader(
          this.serializeWitness(witness_args_alone)
        );
        this.hasher.update(serializeBigInt(witeness_alone.length()));
        this.hasher.update(witeness_alone);
      }

      // 3. generate the sign-message, ready to be signed.
      const sig_hash = this.hasher.digestHex();
      messages.push({
        index: i,
        message: sig_hash, // hex string
        lock: inputCells[i].lock,
      });
      console.log(sig_hash);
      this.hasher = new CKBHasher();

      // 4. sign tx with each account
      for(let l=0;l<account_ids.length;l++){
        const signature = this.signMessage(sig_hash, account_ids[l]);

        // 5. put the signature back to the first witness of the group.
        const sig_offset = serializedMultisigScript.length + l * 130;
        witness_args.lock = witness_args.lock?.substring(0, sig_offset) + signature.slice(2) + witness_args.lock?.substring(sig_offset+130);
      }

      signedWitness[group_index] = this.serializeWitness(witness_args);
    }
    // 6. return the complete tx which can be uploaded on-chain directly through rpc.
    return { ...raw_tx, ...{ witnesses: signedWitness } };
  }

  sign_CustomTypeScript(
    raw_tx: RawTransaction,
    witnessArgs: WitnessArgs[]
  ){
    
  }

  deploy_contract(
    compiled_code: HexString, // the smart contract code compiled into hex string
    length: number, // how much the output cell which contains the actual contract code needs
    raw_tx_without_output: RawTransaction,
    input_cells: Cell[],
    mode: ContractMode,
    account_id = 0
  ){
    if(mode === "upgradable")
      return this.deploy_upgradable_contract(compiled_code, length, raw_tx_without_output, input_cells, account_id);

    // first let's complete the raw transaction with outputs and output-data
    if(mode === "normal"){ 
      // contract is immutable in normal mode
      raw_tx_without_output.outputs[0] = {
        capacity: '0x' + length.toString(16),
        lock: {
          code_hash: CONST.BURNER_LOCK.code_hash,
          args: CONST.BURNER_LOCK.args,
          hash_type: CONST.BURNER_LOCK.hash_type === "type"?"type":"data"
        }
      };
      raw_tx_without_output.outputs_data[0] = compiled_code;

    }else{
      // in test mode, the contract cell can be consumed like normal cell by owner
      raw_tx_without_output.outputs[0] = {
        capacity: '0x' + length.toString(16),
        lock: {
          code_hash: Config.SCRIPTS.SECP256K1_BLAKE160.CODE_HASH,
          args: user.account[account_id].lock_arg,
          hash_type: Config.SCRIPTS.SECP256K1_BLAKE160.HASH_TYPE == "type"?"type":"data"
        }
      };
      raw_tx_without_output.outputs_data[0] = compiled_code;

    }

    // now we can sign this tx and ready to send it through RPC.
    const witnessArgs: WitnessArgs[] = [{
      lock: '0x'
    }]
    const tx = this.sign_P2PKH(raw_tx_without_output, witnessArgs, input_cells, account_id = account_id);
    return tx;
  }

  deploy_upgradable_contract(
    compiled_code: HexString, // the smart contract code compiled into hex string
    length: number, // how much the output cell which contains the actual contract code needs
    raw_tx_without_output: RawTransaction,
    input_cells: Cell[],
    account_id = 0
  ){

  }

  generateCodeHashFromContractCell(output_cell: Cell){
    const hasher = new CKBHasher();
    hasher.update(core.SerializeCellOutput(normalizers.NormalizeCellOutput(output_cell)));
    return hasher.digestHex().slice(0, 42);
  }

  generateTestContractCode(){
    const file = path.resolve(CONST.TEST_CONTRACT);
    const source_code = fs.readFileSync(file);
    return {
      length: source_code.byteLength,
      data: source_code.toString('hex')
    };
  }

  // the multisigArgs acuttally is the lock_arg of the multisig address.
  // the method to generate multisigArgs is quite simple: 
  //    1. serialize the multisigScript, and get first 20th-blake2b-hash
  //    2. if since is not null, just append it after.
  generateMultisigArgs(serializedMultisigScript: string, since: string): string{
    let sinceLE = "0x";
    if (since != null) {
        sinceLE = toBigUInt64LE(BigInt(since));
    }
    return (new CKBHasher().update(serializedMultisigScript).digestHex().slice(0, 42) +
        sinceLE.slice(2));
  }

  serializeMultisigScript(multisigScript: MultisigScript): string{
    if (multisigScript.S !== 0)throw new Error("S in MultisigScript must be 0 now!");

    if (multisigScript.R < 0 || multisigScript.R > 255) {
      throw new Error("`R` should be less than 256!");
    }
    if (multisigScript.M < 0 || multisigScript.M > 255) {
        throw new Error("`M` should be less than 256!");
    }
    if (multisigScript.N < 0 || multisigScript.N > 255) {
      throw new Error("`M` should be less than 256!");
    }
    if (multisigScript.publicKeyHashes.length !== multisigScript.N) {
      throw new Error("`N` should match the length of publickeyhashes!");
    }
    // TODO: validate publicKeyHashes
    return ("0x00" +
        ("00" + multisigScript.R.toString(16)).slice(-2) +
        ("00" + multisigScript.M.toString(16)).slice(-2) +
        ("00" + multisigScript.N.toString(16)).slice(-2) +
        multisigScript.publicKeyHashes.map((h) => h.slice(2)).join(""));
  }
  
  groupInputs(inputCells: Cell[]): InputsGroup[] {
    var groups: InputsGroup[] = [];
    inputCells.forEach((cell, index) => {
      this.hasher = new CKBHasher();
      this.hasher.update(
        new Reader(
          core.SerializeScript(normalizers.NormalizeScript(cell.lock))
        ).serializeJson()
      );
      const scripthash = this.hasher.digestHex();

      // find if the same scripthash group exits.
      // if exits, push the current inputcells's index into this group.
      // else, create a new group and push the first item.
      const group = groups.find((g) => g.hash === scripthash);
      if (group) {
        const i = groups.findIndex((g) => g.hash === scripthash);
        groups[i].child.push(index);
      } else {
        groups.push({
          hash: scripthash,
          child: [index],
        });
      }
    });

    return groups;
  }

  generateTxHash(raw_tx: RawTransaction): HexString {
    return ckbHash(
      core.SerializeRawTransaction(normalizers.NormalizeRawTransaction(raw_tx))
    ).serializeJson();
  }

  signMessage(msg: HexString, account_id:number=0): HexString {
    //const keystore = Keystore.load(user.account.keystore);
    const file = path.resolve(user.account[account_id].keystore);
    const keystore = Keystore.load(file);
    const private_key = keystore.extendedPrivateKey(user.account[account_id].password)
      .privateKey;
    return key.signRecoverable(msg, private_key);
  }

  async send_tx(tx: Transaction): Promise<HexString>{
    const rpc = new RPC("http://127.0.0.1:8114");
    const real_txHash = await rpc.send_transaction(tx);
    return real_txHash;
  }

  toSimpleMessage(
    tx_hash: HexString,
    length: ArrayBuffer,
    witness: Reader
  ): HexString {
    this.hasher = new CKBHasher();
    this.hasher.update(tx_hash);
    this.hasher.update(length);
    this.hasher.update(witness);
    return this.hasher.digestHex();
  }

  toMessage(
    tx_hash: HexString,
    raw_tx: RawTransaction,
    witnessArgs: WitnessArgs[],
    inputCells: Cell[]
  ): Message[] {
    const witnesses = this.serializeWitnesses(witnessArgs);
    const tx: Transaction = { ...raw_tx, ...{ witnesses: witnesses } };
    const messages = [];
    const used = tx.inputs.map((_input) => false);
    for (let i = 0; i < tx.inputs.length; i++) {
      if (used[i]) {
        continue;
      }
      if (i >= tx.witnesses.length) {
        throw new Error(
          `Input ${i} starts a new script group, but witness is missing!`
        );
      }
      used[i] = true;
      this.hasher.update(tx_hash);
      const firstWitness = new Reader(tx.witnesses[i]);
      this.hasher.update(serializeBigInt(firstWitness.length()));
      this.hasher.update(firstWitness);
      for (
        let j = i + 1;
        j < tx.inputs.length && j < tx.witnesses.length;
        j++
      ) {
        if (inputCells[i].lock === inputCells[j].lock) {
          used[j] = true;
          const currentWitness = new Reader(tx.witnesses[j]);
          this.hasher.update(serializeBigInt(currentWitness.length()));
          this.hasher.update(currentWitness);
        }
      }
      messages.push({
        index: i,
        message: this.hasher.digestHex(), // hex string
        lock: inputCells[i].lock,
      });

      this.hasher = new CKBHasher();
    }
    return messages;
  }

  serializeWitnesses(witnessArgs: WitnessArgs[]) {
    return witnessArgs.map((w) =>
      new Reader(
        core.SerializeWitnessArgs(normalizers.NormalizeWitnessArgs(w))
      ).serializeJson()
    );
  }

  serializeWitness(witnessArg: WitnessArgs) {
    return new Reader(
        core.SerializeWitnessArgs(normalizers.NormalizeWitnessArgs(witnessArg))
    ).serializeJson();
  }

  FillSignedWitnesses(
    tx: Transaction,
    messages: Message[],
    witnesses: HexString[]
  ) {
    if (messages.length !== witnesses.length) {
      throw new Error("Invalid number of witnesses!");
    }
    for (let i = 0; i < messages.length; i++) {
      tx.witnesses[messages[i].index] = witnesses[i];
    }
    return tx;
  }
}

