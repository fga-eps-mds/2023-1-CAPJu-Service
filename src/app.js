import swaggerUI from "swagger-ui-express";
import express from "express";
import cors from "cors";
import routes from "./routes.js";
import Database from "./database/index.js";
import swaggerFile from "./swagger/swaggerFile.js";
import cron from "node-cron";
import EmailController from "./controllers/EmailController.js";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

cron.schedule("0 0 0 * * *", () => {
  EmailController.sendEmail();
});

cron.schedule("*/10 * * * * *", () => {
  EmailController.sendEmail();
});
app.use("/api/v1/docs", swaggerUI.serve, swaggerUI.setup(swaggerFile));

export default app;
