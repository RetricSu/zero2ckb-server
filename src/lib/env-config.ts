import { env } from "process";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: "./.env" });

export const envConfig = {
  port: env.PORT || 3000,
  ckbRpc: env.CKB_RPC || "http://localhost:8114",
  indexerDbPath:
    env.INDEXER_DB_PATH || path.resolve(__dirname, "../../indexed-db"),
};
