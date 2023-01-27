import app from "./app.js";
import { config } from "dotenv";
import https from 'https';
import fs from 'fs';
import path from 'path';
import Database from "./database/index.js";

config();

const __dirname = './';
const sslServer = https.createServer({
     key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
     cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
     },
     app
 );

const listener = sslServer.listen(process.env.PORT || 3333,
  () => console.log("Server running")
);

async function failGracefully() {
  listener.close();
  await Database.connection.close();
  process.exit(0);
}

process.on("SIGTERM", failGracefully);
process.on("SIGINT", failGracefully);
