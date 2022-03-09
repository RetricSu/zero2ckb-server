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
- ckb version: `ckb_v0.38.1`
- init ckb devnet with the specific genesis message: "zfRgxIjdaTftx6aW7n"

you can take `scripts/start-ckb.sh` for ref.

run:

```sh
yarn build
yarn serve
```
