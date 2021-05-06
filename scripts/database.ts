/** Bootstrap data in database */

import restWithMenu from "../misc/restaurant_with_menu.json";
import userWithPurchase from "../misc/users_with_purchase_history.json";
import db from "../src/lib/db";
import logger from "../src/lib/logger";
import Menu from "../src/model/menu";
import OpeningHour from "../src/model/openingHour";
import Restaurant from "../src/model/restaurant";
import TransactionHistory from "../src/model/transactionHistory";
import User from "../src/model/user";
import { IOpeningHour } from "./types/database";

/** SQL Schema */

/** Env */

const log = logger("bootstrap-database");

/** Parser */
const WEEK_DAY = new Map(Object.entries({
    Mon: 1,
    Tue: 2,
    Tues: 2,
    Wed: 3,
    Weds: 3,
    Thu: 4,
    Thurs: 4,
    Fri: 5,
    Sat: 6,
    Sun: 0
}));

const parseWeekdays = (openingHours: string) => {
    const weekDays: number[] = [];
    let weekDay: string[] = [];
    let subsequent: boolean = false;
    for (const c of openingHours) {
        if (c === ",") {
            if (subsequent) {
                const start = weekDays[0];
                const _weekDay = weekDay.join("");
                const end = WEEK_DAY.get(_weekDay);
                if (end === undefined) {
                    throw new Error(`unable to get value end ${_weekDay}`);
                }

                for (let i = start + 1; i !== end; i++) {
                    if (i > 6) {
                        i = -1;
                        continue;
                    }

                    weekDays.push(i);
                }
                weekDays.push(end);
            } else {
                const _weekDay = weekDay.join("");
                const id = WEEK_DAY.get(_weekDay);
                if (id === undefined) {
                    throw new Error(`unable to get id value in weekDays ${_weekDay}`);
                }
                weekDays.push(id);
            }

            weekDay = [];
            subsequent = false;
            continue;
        }

        if (c === "-") {
            subsequent = true;
            const _weekDay = weekDay.join("");
            const id = WEEK_DAY.get(_weekDay);
            if (id === undefined) {
                throw new Error(`unable to get id value in weekDays ${_weekDay}`);
            }
            weekDays.push(id);
            weekDay = [];
            continue;
        }

        const code = c.charCodeAt(0);
        if (!(code > 64 && code < 91) && !(code > 96 && code < 123)) { // non a-z, A-Z
            break;
        }

        weekDay.push(c);
    }

    return weekDays;
};

const parseTimeRange = (openingHours: string) => {
    if (openingHours.length < 1) {
        throw new Error("openingHours is empty");
    } 

    let startAt = 0;
    for (const c of openingHours) {
        const code = c.charCodeAt(0);
        if (code > 47 && code < 58) { // non 0-9
            break;
        }

        startAt++;
    }

    let startTime = "";
    let endTime = "";

    let _endTime = false;
    let containsMinutes = false;
    for (let i = startAt; i < openingHours.length; i++) {
        // assume any word starting 'a' meaning 'am', starting 'p' meaning 'pm'
        const c = openingHours.charAt(i);
        if (c === "a" || c === "p") {
            let _openingHour = openingHours.substring(startAt, i);
            if (!containsMinutes) {
                _openingHour += ":00";
            }
            _openingHour += openingHours.substring(i, i + 2); // 'am', 'pm'

            if (!_endTime) {
                startTime = _openingHour;
            } else {
                endTime = _openingHour;
            }
            continue;
        } else if (c === "-") {
            _endTime = true;
            containsMinutes = false;
            startAt = i + 1;
        } else if (c === ":") {
            containsMinutes = true;
        }
    }

    return { startTime, endTime };
};

const parseOpeningHour = (openingHours: string) => {
    const timeRanges = openingHours.replace(/\s+/g, "").split("/"); // remove whitespaces and splited by '/'
    // Mon,Fri2:30pm-8pm
    const _openingHours: IOpeningHour[] = [];
    for (const t of timeRanges) {
        const {startTime, endTime} = parseTimeRange(t);
        const weekDays = parseWeekdays(t);  

        for (const weekDay of weekDays) {
            _openingHours.push({
                weekDay,
                startTime,
                endTime,
            });
        }
    }
    return _openingHours;
};

// invoke 'bootstrapRestWithMenu' to get mapping cache
const mappingRest: Map<string, number> = new Map();
const mappingDishKey = (restId: number, dishName: string) => `${restId}|_|${dishName}`;
const mappingDish: Map<string, number> = new Map();

const bootstrapRestWithMenu = async () => {
    const menus: Menu[] = [];
    const openingHours: OpeningHour[] = [];
    const rests: Restaurant[] = restWithMenu.map((value, index) => {
        mappingRest.set(value.restaurantName, index);

        const _menus = value.menu.map((_value) => {
            const menu = Menu.build({
                dishName: _value.dishName,
                price: _value.price,
                restId: index,
            });

            return menu;
        });
        Array.prototype.push.apply(menus, _menus);

        const _openingHours = parseOpeningHour(value.openingHours).map((_value) => {
            const {weekDay, startTime, endTime} = _value;

            const openingHour = OpeningHour.build({
                weekDay,
                startTime,
                endTime,
                restId: index
            });

            return openingHour;
        });
        Array.prototype.push.apply(openingHours, _openingHours);

        const rest = Restaurant.build({
            cashBalance: value.cashBalance,
            name: value.restaurantName,
            id: index
        });

        return rest;
    });

    await Promise.all(rests.map(r => r.save()));
    const savedMenus = await Promise.all(menus.map(m => m.save()));
    savedMenus.map((m) => {
        mappingDish.set(mappingDishKey(m.restId, m.dishName), m.id);
    });
    await Promise.all(openingHours.map(o => o.save()));
};

const bootstrapUserWithPurchase = async () => {
    const purchaseHistories: TransactionHistory[] = [];
    const users: User[] = userWithPurchase.map((value, index) => {
        const {id, name, cashBalance, purchaseHistory} = value;

        const _purchaseHistories = purchaseHistory.map((_value, _index) => {
            const {dishName, restaurantName, transactionAmount, transactionDate} = _value;
            
            const restId = mappingRest.get(restaurantName);
            if (restId === undefined) {
                throw new Error(`restId is undefined: ${restaurantName}`);
            }

            const menuId = mappingDish.get(mappingDishKey(restId, dishName));
            if (menuId === undefined) {
                throw new Error(`menuId is undefined ${restId} ${dishName}`);
            }

            const _purchaseHistory = TransactionHistory.build({
                name: dishName,
                amount: transactionAmount,
                date: transactionDate,
                menuId,
                userId: id,
                restId,
            });
            return _purchaseHistory;
        });
        Array.prototype.push.apply(purchaseHistories, _purchaseHistories);

        const user = User.build({
            id,
            name,
            cashBalance
        });
        return user;
    });

    await Promise.all(users.map(u => u.save()));
    await Promise.all(purchaseHistories.map(p => p.save()));
};

/** Main program */
db.getConnection()
    .then(conn => {
        return conn.sync();
    })
    .then(_ => {
        log.info("bootstrapRestWithMenu...");
        return bootstrapRestWithMenu();
    })
    .then(_ => {
        log.info("bootstrapUserWithPurchase...");
        return bootstrapUserWithPurchase();
    })
    .then(_ => {
        log.info("Successfully bootstrap data into database");
    })
    .catch(error => {
        log.error("bootstraping database failure...");
        log.log({
            level: "error",
            message: "",
            error
        });
    });