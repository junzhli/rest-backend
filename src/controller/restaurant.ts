import express from "express";
import { findDish, findRestaurantOrDishByName, findRestaurantsByPriceAndNumbersOfDishesWithLimit, findRestaurantsByWeekDayAndTime, findUser, processUserPurchaseWithDish } from "../lib/db/query";
import logger from "../lib/logger";
import { IResponseBodyRestaurant, IResponseBodyRestaurantOrDish, IResponseBodyRestaurantWithOpeningHour } from "./types/restaurant";

const log = logger("restaurant-controller");

/**
 * 
 * @api {get} /restaurant "Request restaurants"
 * @apiName getRestaurantsByDate
 * @apiGroup Restaurant
 * 
 * @apiParam  {String} date Date
 * @apiParam  {String} time Time
 * 
 * @apiSuccess (200) {type} name description
 * 
 * @apiParamExample  {type} Request-Example:
 * {
 *     property : value
 * }
 * 
 * 
 * @apiSuccessExample {type} Success-Response:
 * {
 *     property : value
 * }
 * 
 * 
 */
const getRestaurantsByDate = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const {date, time} = req.query;
        if (typeof date !== "string" || typeof time !== "string") {
            throw new Error("date or time is not string");
        }

        const weekDay = (new Date(date)).getDay();
        const rests = await findRestaurantsByWeekDayAndTime(weekDay, time);

        const data: IResponseBodyRestaurantWithOpeningHour[] = rests.map((r) => {
            const {id, startTime, endTime, Restaurant} = r;
            if (!Restaurant) {
                throw new Error("restaurant instance is undefined");
            }
            const {name, cashBalance} = Restaurant;

            return {
                id,
                name,
                cashBalance,
                weekDay: r.weekDay,
                startTime,
                endTime
            };
        });

        if (data.length === 0) {
            res.status(404).json([]);
            return;
        }

        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

/**
 * 
 * @api {method} /path title
 * @apiName apiName
 * @apiGroup group
 * @apiVersion  major.minor.patch
 * 
 * 
 * @apiParam  {String} paramName description
 * 
 * @apiSuccess (200) {type} name description
 * 
 * @apiParamExample  {type} Request-Example:
 * {
 *     property : value
 * }
 * 
 * 
 * @apiSuccessExample {type} Success-Response:
 * {
 *     property : value
 * }
 * 
 * 
 */
const getRestaurantsByDishPriceRangeAndNumberOfDishes = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const {top, dishes, priceStart, priceEnd, equality} = req.query;
        if (typeof top !== "string" || typeof dishes !== "string"
            || typeof priceStart !== "string" ||
            typeof priceEnd !== "string" || typeof equality !== "string") {
            throw new Error("top, dishes, priceStart, priceEnd or equality is not string");
        }
        const _top = Number(top);
        const _dishes = Number(dishes);
        const _priceStart = Number(priceStart);
        const _priceEnd = Number(priceEnd);
        if (isNaN(_top) || isNaN(_priceStart) || isNaN(_priceEnd)) {
            throw new Error("top or price is NaN");
        }

        const lessThan = (equality === "0") ? true : false; // 0: true, 1: false
        const rests = await findRestaurantsByPriceAndNumbersOfDishesWithLimit(_top, _dishes, _priceStart, _priceEnd, lessThan);
        
        const data: IResponseBodyRestaurant[] = rests.map((r) => {
            const {id, name, cashBalance} = r;

            return {
                id,
                name,
                cashBalance,
            };
        });

        if (data.length === 0) {
            res.status(404).json([]);
            return;
        }
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

const getResturantsOrDishesByName = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const {name} = req.query;
        if (typeof name !== "string") {
            throw new Error("name is not string");
        }

        const words = name.split(" ");

        const resultSet = await findRestaurantOrDishByName(words);
        const data: IResponseBodyRestaurantOrDish[] = resultSet.map(r => {
            const {id, restId, type} = r;
            
            return {
                id,
                name: r.name,
                type,
                restId: (type === "dish") ? restId : undefined
            };
        });
        
        if (data.length === 0) {
            res.status(404).json([]);
            return;
        }
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

const purchaseDish = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const {userId, dishId} = req.body;
        if (typeof userId !== "number" || typeof dishId !== "number") {
            throw new Error("userId or dishId is not number");
        }

        const user = await findUser(userId);
        if (!user) {
            res.status(400).json({
                error: "user is not found"
            });
            return;
        }

        const dish = await findDish(dishId);
        if (!dish) {
            res.status(400).json({
                error: "dish is not found"
            });
            return;
        }

        if (user.cashBalance < dish.price) {
            res.status(400).json({
                error: "user cash is insuffient to purchase the dish"
            });
            return;
        }

        try {
            await processUserPurchaseWithDish(userId, dishId);
        } catch (error) {
            log.error(`transactional exec failure when processing user purchase: userId=${userId} dishId=${dishId}`);
            log.log({ level: "error", message: "", error });
            res.status(400).json({
                error: "some unexpected error occurred when processing user purchase. please try again later."
            });
            return;
        }

        res.status(200).json({
            success: "processed successfully"
        });
    } catch (error) {
        next(error);
    }
};

export {
    getRestaurantsByDate,
    getRestaurantsByDishPriceRangeAndNumberOfDishes,
    getResturantsOrDishesByName,
    purchaseDish
};