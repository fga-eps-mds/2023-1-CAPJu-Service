import swaggerUI from 'swagger-ui-express';
import express from "express";
import cors from "cors";
import routes from "./routes.js";
import Database from "./database/index.js";
import swaggerFile from "./swagger/swaggerFile.js";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(routes);
app.use(
    '/api/v1/docs',
    swaggerUI.serve,
    swaggerUI.setup(swaggerFile),
);

Database.connection.authenticate()
    .then(() => console.log("Connected to DB"))
    .catch((error) => console.log(error));

export default app;
