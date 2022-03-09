#!/bin/bash

CKB=ckb
CKB_VERSION=0.38.1
DIR=$PWD/ckb
OS=$(uname -s)
CKB_DOWNLOAD_FOLDER=ckb_v${CKB_VERSION}_$(uname -m)-unknown-${OS,,}-gnu
CKB_FILE_NAME=$CKB_DOWNLOAD_FOLDER.tar.gz
CKB_GENESIS_MESSAGE="zfRgxIjdaTftx6aW7n"
MINER_LOCK_ARG="0x43d509d97f26007a285f39241cffcd411157196c" # first account from src/config/user.json account[0].lock_arg

download(){
  # download ckb, must be v0.38.1
  mkdir -p $DIR
  
  curl -L https://github.com/nervosnetwork/ckb/releases/download/v${CKB_VERSION}/${CKB_FILE_NAME} -o ${DIR}/${CKB_FILE_NAME}
  tar xf $DIR/$CKB_FILE_NAME -C $DIR
}

setMinerArgInCkbToml(){
  CKB_TOML_FILE=$DIR/$CKB_DOWNLOAD_FOLDER/node1/ckb.toml

  # first, delete block_assembler
  sed -i '/\# \[block_assembler\]/{n;d}' $CKB_TOML_FILE 
  sed -i '/\# \[block_assembler\]/{n;d}' $CKB_TOML_FILE 
  sed -i '/\# \[block_assembler\]/{n;d}' $CKB_TOML_FILE 
  sed -i '/\# \[block_assembler\]/{n;d}' $CKB_TOML_FILE 
  # second, add an new one with block_assembler
  sed -i "/\# \[block_assembler\]/a\[block_assembler]" $CKB_TOML_FILE
  sed -i '/\# \[block_assembler\]/d' $CKB_TOML_FILE 
  sed -i "/\[block_assembler\]/a\code_hash = '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8'" $CKB_TOML_FILE
  sed -i "/\[block_assembler\]/a\args = '$MINER_LOCK_ARG'" $CKB_TOML_FILE
  sed -i "/\[block_assembler\]/a\hash_type = 'type'" $CKB_TOML_FILE
  sed -i "/\[block_assembler\]/a\message = '0x'" $CKB_TOML_FILE
}

setGenesisMessageInDevToml(){
  CKB_DEV_TOML_FILE=$DIR/$CKB_DOWNLOAD_FOLDER/node1/specs/dev.toml
  # first, delete block_assembler
  sed -i '/\[genesis.genesis_cell\]/{n;d}' $CKB_DEV_TOML_FILE 
  # second, add an new one with block_assembler
  sed -i "/\[genesis.genesis_cell\]/a\message = '$CKB_GENESIS_MESSAGE'" $CKB_DEV_TOML_FILE
}

run(){
  if [ ! -x "$(command -v "${CKB}")" ] \
      || [ "$(${CKB} --version | awk '{ print $2 }' | tr -d ' ')" != "${CKB_VERSION}" ]; then \
    echo "Require ckb v0.38.1, try download to install.."; \
    download
    CKB=$DIR/$CKB_DOWNLOAD_FOLDER/ckb
  fi

  # init devnet 
  cd $DIR/$CKB_DOWNLOAD_FOLDER && mkdir -p node1
  $CKB -C node1 init --chain dev || echo "init ckb failed.";
  cd ../..
  echo "finish."

  # edit ckb miner
  setMinerArgInCkbToml
  setGenesisMessageInDevToml
  # start ckb node
  $CKB -C node1 run
}

# start
run
