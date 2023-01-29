import app from "./app.js";
import { config } from "dotenv";
import Database from "./database/index.js";

config();

const listener = app.listen(process.env.PORT || 3333,
  () => console.log("Server running")
);

async function failGracefully() {
  listener.close();
  await Database.connection.close();
  process.exit(0);
}

process.on("SIGTERM", failGracefully);
process.on("SIGINT", failGracefully);
