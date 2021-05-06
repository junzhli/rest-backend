import app from "./app";
import db from "./lib/db";
import logger from "./lib/logger";

const log = logger("app");

const port = process.env.PORT || 8080;
app.listen(port, () =>
    log.info(`rest-api-backend project listening on port ${port}!`)
);

db.getSequelizeInstance().sync()
    .then(_ => {
        log.info("Defind models syncing success");
    })
    .catch((error) => {
        log.error("Defind models syncing failure");
        log.log({
            level: "error",
            message: "",
            error
        });
    });