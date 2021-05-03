import { IDBConfigOptions } from "./types/db";

const DBConfig: IDBConfigOptions = {
    connectionUri: process.env.DB_CONNECTION_URI || "postgres://user:pass@example.com:5432/dbname"
};

export {
    DBConfig
};