import dotenv from "dotenv";
import { IDBConfigOptions } from "./types/db";

dotenv.config();

const DBConfig: IDBConfigOptions = {
    connectionUri: process.env.DATABASE_URL || "postgres://user:pass@example.com:5432/dbname",
    verboseLogging: (process.env.DB_DISABLE_LOGGING) ? false : true
};

export {
    DBConfig
};