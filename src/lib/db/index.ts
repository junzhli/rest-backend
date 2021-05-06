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
        ssl = false,
     }: IDBConfigOptions) {
        this.instance = new Sequelize(connectionUri, 
             (ssl) ? {
                logging: verboseLogging, 
                ssl: true, 
                dialectOptions: { 
                    ssl: {
                        require: true,
                        rejectUnauthorized: false
                    }
                },
                pool: {
                    max: 10,
                    min: 0,
                    acquire: 180000,
                    idle: 10000
                }
            } : {
                logging: verboseLogging
            });

        this.checkConnection()
            .then((connected) => {
                if (!connected) {
                    log.warn("connection failure...");
                    return;
                }

                // install extensions if not exists
                this.instance.query("create extension if not exists pg_trgm", {raw: true})
                    .catch(error => {
                        log.error("Extension installation: pg_trgm failure");
                        log.log({
                            level: "error",
                            message: "",
                            error
                        });
                    });
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