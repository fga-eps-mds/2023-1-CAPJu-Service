import { Database } from "../TestDatabase.js";
import "sequelize";
import supertest from "supertest";
import Process from "../../models/Process.js";
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

    expect(newProcessResponse.status).toBe(200);
  });

  test("new process and search", async () => {
    let processMock = [
      {
        record: "12345678901234567891",
        idUnit: 1,
        priority: 0,
        idFlow: 1,
        nickname: "Meu Primeiro Prcesso",
      },
      {
        record: "12345678901234567892",
        idUnit: 1,
        priority: 0,
        idFlow: 1,
        nickname: "Meu Segundo Prcesso",
      },
    ];

    const allProcesses = [];
    for (const process of processMock) {
      const newProcessResponse = await supertest(app)
        .post("/newProcess")
        .send(process);
      expect(newProcessResponse.status).toBe(200);
      expect(newProcessResponse.body.message).toEqual("Criado com sucesso!");
      allProcesses.push(newProcessResponse.body);
    }
    let processes = await Process.findAll();
    for (let index = 0; index < processes.length; index++) {
      expect(processes[index]?.dataValues?.record).toEqual(
        processMock[index]?.record
      );
    }
  });
});
