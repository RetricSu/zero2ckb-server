# How To Run

api-server of the website [zero2ckb](https://zero2ckb.ckbapp.dev/)

```sh
$ cat > ./.env <<EOF
MODE=<mode "production" or "development", optional, default development, will effect the chain scripts info in lumos-config.json>
PORT=<server port, optional, default 3000>
EOF
```

require: `node 14`

```sh
npm run build
npm run serve
```
