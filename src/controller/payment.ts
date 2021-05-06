import express from "express";
import { findDish, findUser, processUserPurchaseWithDish } from "../lib/db/query";
import logger from "../lib/logger";


const log = logger("payment-controller");

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
                error: -2,
                message: "user is not found"
            });
            return;
        }

        const dish = await findDish(dishId);
        if (!dish) {
            res.status(400).json({
                error: -3,
                message: "dish is not found"
            });
            return;
        }

        if (user.cashBalance < dish.price) {
            res.status(400).json({
                error: -4,
                message: "user cash is insuffient to purchase the dish"
            });
            return;
        }

        try {
            await processUserPurchaseWithDish(userId, dishId);
        } catch (error) {
            log.error(`transactional exec failure when processing user purchase: userId=${userId} dishId=${dishId}`);
            log.log({ level: "error", message: "", error });
            res.status(400).json({
                error: -5,
                message: "some unexpected error occurred when processing user purchase. please try again later."
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
    purchaseDish
};