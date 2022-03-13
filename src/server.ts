import path from "path";
import { envConfig } from "./lib/env-config";
import config from "./config/const.json";
import express from "express";
import cors from "cors";
import { setUpRouters } from "./lib/http-server";
import { MainRegistry } from "./lib/registry";

const corsOptions = {
  origin: config.CORS_SERVER_LIST.length > 0 ? config.CORS_SERVER_LIST : "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};

const PORT = envConfig.port;

const app = express();
app.use(cors(corsOptions));
app.use("/static", express.static(path.join(__dirname, "./contracts")));

const registry = new MainRegistry();
setUpRouters(app, registry, MainRegistry);

console.log("corsOptions: ", corsOptions);

export function start() {
  app.listen(PORT, () => {
    console.log(`${registry.name} started at http://localhost:${PORT}`);
  });
}

start();
