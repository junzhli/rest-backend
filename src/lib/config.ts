import { IDBConfigOptions } from "./types/db";
import dotenv from "dotenv";

dotenv.config();

const DBConfig: IDBConfigOptions = {
    connectionUri: process.env.DB_CONNECTION_URI || "postgres://user:pass@example.com:5432/dbname",
    verboseLogging: (process.env.DB_DISABLE_LOGGING) ? false : true
};

export {
    DBConfig
};