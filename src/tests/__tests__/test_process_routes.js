import { Database } from "../TestDatabase.js";
import "sequelize";
import supertest from "supertest";
import { app, injectDB } from "../TestApp";

describe("process endpoints", () => {
  beforeEach(async () => {
    const database = new Database();
    await database.migrate();
    await database.seed();
    injectDB(database);
  });

  test("new process", async () => {
    const testProcess = {
      record: "12345678901234567890",
      idUnit: 1,
      priority: 0,
      idFlow: 1,
      nickname: "Meu Primeiro Prcesso",
    };

    const newProcessResponse = await supertest(app)
      .post("/newProcess")
      .send(testProcess);

    console.log("newProcessResponse", newProcessResponse.body);
    expect(newProcessResponse.status).toBe(200);
  });
});
