import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDoc from "../swagger.json";
import {errorHandler} from "./middleware/errorHandlers";
import loggerHandler from "./middleware/loggerHandler";
import payment from "./router/payment";
import search from "./router/search";

const app = express();

app.set("etag", "strong"); // use strong etag
app.use(loggerHandler);

app.use("/search", search());
app.use("/payment", payment());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use(errorHandler);
// app.use(notFoundHandler);

export default app;
