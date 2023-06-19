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
      idPriority: 1,
    };

    const newProcessResponse = await supertest(app)
      .post("/newProcess")
      .send(testProcess);
    expect(newProcessResponse.status).toBe(200);
  });

  test("new process and update it", async () => {
    const testProcess = {
      record: "12345678901234567890",
      idUnit: 1,
      idPriority: 1,
    };

    const newProcessResponse = await supertest(app)
      .post("/newProcess")
      .send(testProcess);
    expect(newProcessResponse.status).toBe(200);

    const responseUpdate = await supertest(app)
      .put("/updateProcess")
      .send({ record: "12345678901234567890", idPriority: 2 });
    expect(responseUpdate.status).toBe(500);
  });

  test("new process and get one by id", async () => {
    const testProcess = {
      record: "12345678901234567890",
      idUnit: 1,
      idPriority: 1,
    };

    const newProcessResponse = await supertest(app)
      .post("/newProcess")
      .send(testProcess);
    expect(newProcessResponse.status).toBe(200);

    const getProcessById = await supertest(app).get(
      `/getOneProcess/${testProcess.record}`
    );
    expect(getProcessById.status).toBe(404);
  });

  test("new process and delete it", async () => {
    const testProcess = {
      record: "12345678901234567890",
      idUnit: 1,
      idPriority: 1,
    };

    const newProcessResponse = await supertest(app)
      .post("/newProcess")
      .send(testProcess);
    expect(newProcessResponse.status).toBe(200);

    const responseDelete = await supertest(app).delete(
      `/deleteProcess/${newProcessResponse.body.idProcess}`
    );
    expect(responseDelete.status).toBe(404);
    expect(responseDelete.body.idProcess).toEqual(
      newProcessResponse.body.idProcess
    );
  });
});
