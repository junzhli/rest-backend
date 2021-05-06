import { literal, Op, QueryTypes, Transaction } from "sequelize";
import db from ".";
import Menu from "../../model/menu";
import OpeningHour from "../../model/openingHour";
import Restaurant from "../../model/restaurant";
import TransactionHistory from "../../model/transactionHistory";
import User from "../../model/user";
import { IResultFindRestaurantOrDishByName } from "./types/query";

const findRestaurantsByWeekDayAndTime = async (weekDay: number, time: string) => {
    return OpeningHour.findAll({
        attributes: ["id", "weekDay", "startTime", "endTime"],
        where: {
            weekDay,
            startTime: {
                [Op.gte]: time
            },
            endTime: {
                [Op.lte]: time
            }
        },
        order: [
            ["id", "ASC"]
        ],
        include: {
            model: Restaurant,
            attributes: ["name", "cashBalance"],
            as: "Restaurant"
        }
    });
};

const findRestaurantsByPriceAndNumbersOfDishesWithLimit = (limit: number, dishes: number, price: number, lessThan: boolean) => {
    // SELECT id, name, "cashBalance" 
    // FROM 
    // (SELECT "Menus"."restId", COUNT(*) FROM "Menus" WHERE price >= 10 GROUP BY "Menus"."restId" HAVING COUNT(*) >= 10) 
    // AS t INNER JOIN "Restaurants" ON t."restId" = "Restaurants"."id" 
    // ORDER BY "Restaurants"."id" ASC
    const sql = (lessThan) ? `SELECT id, name, "cashBalance" FROM (SELECT "Menus"."restId", COUNT(*) FROM "Menus" WHERE price <= ${price} GROUP BY "Menus"."restId" HAVING COUNT(*) >= ${dishes}) AS t INNER JOIN "Restaurants" ON t."restId" = "Restaurants"."id" ORDER BY "Restaurants"."id" ASC` : 
    `SELECT id, name, "cashBalance" FROM (SELECT "Menus"."restId", COUNT(*) FROM "Menus" WHERE price > ${price} GROUP BY "Menus"."restId" HAVING COUNT(*) >= ${dishes}) AS t INNER JOIN "Restaurants" ON t."restId" = "Restaurants"."id" ORDER BY "Restaurants"."id" ASC`;

    return db.getSequelizeInstance().query(sql, { model: Restaurant, mapToModel: true });
};

const findRestaurantOrDishByName = (words: string[]) => {
    const similarity = words.join(" ");
    const ilike = words.map(w => `'%${w}%'`).join(",");

    const sql = `
    (SELECT id, name, similarity("name", '${similarity}') as revl, 'rest' as type, NULL as "restId" FROM "Restaurants" 
    WHERE "Restaurants"."name" ilike any(array[${ilike}])) union ALL 
    (SELECT id, "dishName", similarity("dishName", '${similarity}') as revl, 'dish' as type, "restId" FROM "Menus" 
    WHERE "Menus"."dishName" ilike any(array[${ilike}])) ORDER BY revl DESC
    `;

    return db.getSequelizeInstance().query<IResultFindRestaurantOrDishByName>(sql, { type: QueryTypes.SELECT });
};

const findUser = (userId: number) => {
    return User.findOne({
        attributes: ["id", "cashBalance"],
        where: {
            id: userId
        }
    });
};

const findDish = (dishId: number) => {
    return Menu.findOne({
        attributes: ["id"],
        where: {
            id: dishId
        }
    });
};

const processUserPurchaseWithDish = async (userId: number, dishId: number) => {
    const t = await db.getSequelizeInstance().transaction({isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ});

    try {
        const menu = await Menu.findOne({
            attributes: ["id", "dishName", "price", "restId"],
            where: {
                id: dishId
            },
            transaction: t
        });
        if (!menu) {
            throw new Error(`menu is not found by dishId: ${dishId}`);
        }

        const usersAffected = await User.update({
            cashBalance: literal(`cashBalance-${menu.price}`)
        }, {
            where: {
                id: userId,
                cashBalance: {
                    [Op.gte]: menu.price
                }
            },
            transaction: t
        });
        if (!usersAffected) {
            throw new Error(`no user is found by userId: ${userId}`);
        }

        const restsAffected = await Restaurant.update({
            cashBalance: literal(`cashBalance+${menu.price}`)
        }, {
            where: {
                id: menu.restId
            },
            transaction: t
        });
        if (!restsAffected) {
            throw new Error(`rest is not found by restId: ${menu.restId}`);
        }

        await TransactionHistory.create({
            name: menu.dishName,
            amount: menu.price,
            date: new Date(),
            menuId: menu.id,
            userId,
            restId: menu.restId
        }, { transaction: t });

        await t.commit();
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export {
    findRestaurantsByWeekDayAndTime,
    findRestaurantOrDishByName,
    findRestaurantsByPriceAndNumbersOfDishesWithLimit,
    findUser,
    findDish,
    processUserPurchaseWithDish
};