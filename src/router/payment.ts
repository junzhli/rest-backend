import express from "express";
import { purchaseDish } from "../controller/restaurant";
import inputValidator from "../middleware/inputValidator";

export default () => {
    const router = express.Router();

    router.use(express.json());

    /** User purchase API */

    // search by date (we assume that user has been authenticated and identify user with its userId)
    router.post("/user/purchase", inputValidator.processUserPurchaseWithDish, inputValidator.resultHandler, purchaseDish);

    return router;
};