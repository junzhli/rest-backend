import express from "express";
import {errorHandler} from "./middleware/errorHandlers";
import loggerHandler from "./middleware/loggerHandler";
import payment from "./router/payment";
import restaurant from "./router/restaurant";

const app = express();

app.set("etag", "strong"); // use strong etag
app.use(loggerHandler);

app.use("/restaurant", restaurant());
app.use("/payment", payment());

app.use(errorHandler);
// app.use(notFoundHandler);

export default app;
