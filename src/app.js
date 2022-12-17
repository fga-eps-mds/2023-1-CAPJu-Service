import express from "express";
import cors from "cors";
import routes from "./routes.js";
import Database from "./database/index.js";


const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

export default app;
