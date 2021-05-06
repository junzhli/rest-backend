import { Sequelize } from "sequelize";
import { DBConfig } from "../config";
import logger from "../logger";
import { IDBConfigOptions } from "../types/db";

const log = logger("Database");

class Database {
    private instance: Sequelize;

    constructor({ 
        connectionUri = "postgres://user:pass@example.com:5432/dbname",
        verboseLogging = true,
     }: IDBConfigOptions) {
        this.instance = new Sequelize(connectionUri, {logging: verboseLogging});

        this.checkConnection()
            .then((connected) => {
                if (!connected) {
                    log.warn("connection failure...");
                }
            });
    }

    getSequelizeInstance() {
        return this.instance;
    }

    async getConnection() {
        if (!(await this.checkConnection())) {
            throw new Error("Connection is not ready");
        }

        return this.instance;
    }

    async closeConnection() {
        if (!(await this.checkConnection())) {
            throw new Error("Connection is not ready");
        }

        return this.getSequelizeInstance().close();
    }

    private async checkConnection() {
        try {
            await this.instance.authenticate();
            return true;
        } catch (error) {
            log.error("Authentication failure in connection with database");
            log.log({
                level: "error",
                message: "",
                error
            });
            return false;
        }
    }
}

export default new Database(DBConfig);