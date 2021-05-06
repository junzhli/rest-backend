import express from "express";
import { body, query } from "express-validator";
import { validationResult } from "express-validator";
import logger from "../lib/logger";

const log = logger("input-validator-handler");

const _validatorsBody = {
    userId: body("userId").isNumeric().isInt({min: 0}),
    dishId: body("dishId").isNumeric().isInt({min: 0}),
};

const _validatorsQuery = {
    date: query("date").isDate(),
    time: query("time").matches(/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/),
    top: query("top").isInt({min: 1, max: 100}),
    price: query("price").isInt({min: 0}),
    equality: query("equality").isInt({min: 0, max: 1}),
    name: query("name").isString().isLength({ min: 1 }).trim().customSanitizer((input) => input.replace(/\s\s+/g, " ")),
};

/** Restaurant */

const restaurantQueryInput = [
    _validatorsQuery.date,
    _validatorsQuery.time
];

const restaurantQueryTopByPrice = [
    _validatorsQuery.top,
    _validatorsQuery.price,
    _validatorsQuery.equality,
];

const restaurantOrDishQueryByName = [
    _validatorsQuery.name,
];

const processUserPurchaseWithDish = [
    _validatorsBody.dishId,
    _validatorsBody.userId,
];

const resultHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ error: -1, message: "provided parameters do not fit into what we need"});
        log.warn("provided request with errors: " + JSON.stringify(errors.array()));
        return;
    }
    next();
};

export default {
    restaurantQueryInput,
    restaurantQueryTopByPrice,
    restaurantOrDishQueryByName,
    processUserPurchaseWithDish,
    resultHandler
};