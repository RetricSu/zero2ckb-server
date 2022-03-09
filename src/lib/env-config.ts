import { env } from "process";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export const envConfig = {
  mode: env.MODE === "production" ? "production" : "development",
  port: env.PORT || 3000,
  ckbRpc: env.CKB_RPC || "http://localhost:8114",
  indexerDbPath: env.INDEXER_DB_PATH || "/indexed-db",
};
