# How To Run

api-server of the website [zero2ckb](https://zero2ckb.ckbapp.dev/)

```sh
$ cat > ./.env <<EOF
PORT=<server port, optional, default 3000>
CKB_RPC=<ckb rpc url, optional, default http://localhost:8114>
INDEXER_DB_PATH=<ckb-indexer database dir, optianl, default /indexed-db>
EOF
```

require: 

- `node 14`
- run a specific ckb devnet on your local environment:
  - ckb version: `ckb_v0.38.1`
  - genesis message: `zfRgxIjdaTftx6aW7n`
  - [block assembler's args](https://github.com/RetricSu/zero2ckb-server/blob/develop/scripts/start-ckb.sh#L20-L35): `0x43d509d97f26007a285f39241cffcd411157196c`

you can take `scripts/start-ckb.sh` for ref.

run:

```sh
yarn build
yarn serve
```

## prebuild images

the repo's [github packages](https://github.com/RetricSu/zero2ckb-server/pkgs/container/zero2ckb-server-prebuilds) will deploy prebuild image. the entire project is copy into `/zero2ck-server` folder in the image, with `node_module` pre-installed and typescript code pre-compiled.
