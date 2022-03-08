import { env } from "process";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export const envConfig = {
  mode: env.MODE === "production" ? "production" : "development",
  port: env.PORT || 3000,
};
