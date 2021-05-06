import supertest from "supertest";
import { bootstrapRestWithMenu, bootstrapUserWithPurchase } from "../scripts/database";
import app from "../src/app";
import db from "../src/lib/db";
import logger from "../src/lib/logger";

const log = logger("integration-testing");

const HEADER_CONTENT_TYPE = "application/json; charset=utf-8";

const GLOBAL_API_TIMEOUT = 5000; // 15s

describe("integration testings", () => {
    beforeAll(async (done) => {
        const conn = await db.getConnection();
        log.info("Dropping tables...");
        await db.getSequelizeInstance().drop();
        log.info("Syncing models to database");
        await conn.sync();
        log.info("Bootstraping...");
        await bootstrapRestWithMenu();
        await bootstrapUserWithPurchase();
        done();
    }, 20000);
    
    afterAll(() => {
        return new Promise<void>(async (res, rej) => {
            try {
                await db.closeConnection();
                res();
            } catch (error) {
                rej(error);
            }
        });
    });

    describe("backend project api", () => {
        test("it should be ok to list of restuarent where is opens at specific datetime", async () => {
            const response = await supertest(app)
                .get("/search/date")
                .query({
                    date: "2020-12-30",
                    time: "12:10"
                });

            expect(response.status).toBe(200);
            expect(response.headers["content-type"]).toBe(HEADER_CONTENT_TYPE);
            expect(typeof response.body).toBe("object");
            expect(Array.isArray(response.body)).toEqual(true);
            for (const rest of response.body) {
                expect(typeof rest.id).toBe("number");
                expect(typeof rest.name).toBe("string");
                expect(typeof rest.cashBalance).toBe("number");
                expect(typeof rest.weekDay).toBe("number");
                expect(typeof rest.startTime).toBe("string");
                expect(typeof rest.endTime).toBe("string");
            }
        }, GLOBAL_API_TIMEOUT);

        test("it should be ok to list top x restaurants with less/more than y dishes within price range", async () => {
            const response = await supertest(app)
                .get("/search/price")
                .query({
                    top: 10,
                    priceStart: 5,
                    priceEnd: 30,
                    equality: 1,
                    dishes: 8
                });

            expect(response.status).toBe(200);
            expect(response.headers["content-type"]).toBe(HEADER_CONTENT_TYPE);
            expect(typeof response.body).toBe("object");
            expect(Array.isArray(response.body)).toEqual(true);
            for (const rest of response.body) {
                expect(typeof rest.id).toBe("number");
                expect(typeof rest.name).toBe("string");
                expect(typeof rest.cashBalance).toBe("number");
            }
        }, GLOBAL_API_TIMEOUT);

        // test(`it should be ok to return nothing with code 404 by non-existing id`, async () => {
        //     const response = await supertest(app)
        //         .get(`/heroes/aaaaaaaaaaaaaaaaaaaaaaaaa`);

        //     expect(response.status).toBe(httpStatusCode.NOT_FOUND);
        // }, GLOBAL_API_TIMEOUT);

        test(`it should be ok to list results from the query by name in either dish or restaurant, ranked by relevance`, async () => {
            const response = await supertest(app)
                .get(`/search/name`)
                .query({
                    name: "aPPle"
                });

            expect(response.status).toBe(200);
            expect(response.headers["content-type"]).toBe(HEADER_CONTENT_TYPE);
            expect(typeof response.body).toBe("object");
            expect(Array.isArray(response.body)).toEqual(true);
            for (const item of response.body) {
                expect(typeof item.id).toBe("number");
                expect(typeof item.name).toBe("string");
                expect(typeof item.type).toBe("string");
                if (item.type === "dish") {
                    expect(typeof item.restId).toBe("number");
                }
            }
        }, GLOBAL_API_TIMEOUT);

        test(`it should be ok to purchase dish by user`, async () => {
            const response = await supertest(app)
                .post(`/payment/user/purchase`)
                .send({
                    userId: 9,
                    dishId: 1
                })
                .set("Content-Type", "application/json");

            expect(response.status).toBe(200);
            expect(response.headers["content-type"]).toBe(HEADER_CONTENT_TYPE);
            expect(typeof response.body).toBe("object");
            expect(typeof response.body.success).toBe("string");
        }, GLOBAL_API_TIMEOUT);
    });
});