import express from "express";
import { getRestaurantsByDate, getRestaurantsByDishPriceRangeAndNumberOfDishes, getResturantsOrDishesByName } from "../controller/restaurant";
import inputValidator from "../middleware/inputValidator";

export default () => {
    const router = express.Router();

    router.use(express.json());

    /** Search API */

    // search by date
    router.get("/search/date", inputValidator.restaurantQueryInput, inputValidator.resultHandler, getRestaurantsByDate);

    // search by price
    router.get("/search/price", inputValidator.restaurantQueryTopByPrice, inputValidator.resultHandler, getRestaurantsByDishPriceRangeAndNumberOfDishes);

    // search by restaurant's name or dish's name
    router.get("/search/name", inputValidator.restaurantOrDishQueryByName, inputValidator.resultHandler, getResturantsOrDishesByName);

    return router;
};