import express from "express";
import logger from "../lib/logger";

const log = logger("error-handler-middleware");

const errorHandler = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // operational/technical errors
    log.log({ level: "error", message: "", error: err });
    const sentCode = 500;

    return res.status(sentCode).send();
};

const notFoundHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    return res.status(404).end();
};

export {
    errorHandler,
    notFoundHandler
};
