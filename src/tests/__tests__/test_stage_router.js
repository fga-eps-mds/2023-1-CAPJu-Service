import { Database } from "../TestDatabase.js";
import "sequelize";
import supertest from "supertest";
import { app, injectDB } from "../TestApp";
import Stage from "../../models/Stage.js";
import { tokenToUser } from "../../middleware/authMiddleware.js";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";

describe("stage endpoints", () => {
  beforeEach(async () => {
    const database = new Database();
    await database.migrate();
    await database.seed();
    injectDB(database);
  });

  test("new stage", async () => {
    const testUnit = {
      name: "Unidade Teste",
    };

    const newUnitResponse = await supertest(app)
      .post("/newUnit")
      .send(testUnit);
    expect(newUnitResponse.status).toBe(200);

    const testStage = {
      name: "etapa teste",
      duration: 1,
      idUnit: newUnitResponse.body.idUnit,
    };

    const response = await supertest(app).post("/newStage").send(testStage);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe(testStage.name);
  });

  test("get 400 if create new stage in unit that doesnt exists", async () => {
    const testStage = {
      name: "etapa teste",
      duration: 1,
      idUnit: 1000,
    };

    const response = await supertest(app).post("/newStage").send(testStage);
    expect(response.status).toBe(400);
  });

  test("new stage and delete it", async () => {
    const testUnit = {
      name: "Unidade Teste",
    };

    const newUnitResponse = await supertest(app)
      .post("/newUnit")
      .send(testUnit);
    expect(newUnitResponse.status).toBe(200);

    const testStage = {
      name: "etapa teste",
      duration: 1,
      idUnit: newUnitResponse.body.idUnit,
    };

    const response = await supertest(app).post("/newStage").send(testStage);
    expect(response.status).toBe(200);

    const responseDelete = await supertest(app).delete(
      `/deleteStage/${response.body.idStage}`
    );
    expect(responseDelete.status).toBe(200);
    expect(responseDelete.body.idStage).toEqual(response.body.idStage);
  });

  test("status 401 if delete stage that doesnt exist and delete it", async () => {
    const responseDelete = await supertest(app).delete(`/deleteStage/${1000}`);
    expect(responseDelete.status).toBe(401);
    // expect(responseDelete.body.idStage).toEqual(response.body.idStage);
  });

  test("new stage and check by id", async () => {
    const testUnit = {
      name: "Unidade Teste",
    };

    const newUnitResponse = await supertest(app)
      .post("/newUnit")
      .send(testUnit);
    expect(newUnitResponse.status).toBe(200);
    const testStage = {
      name: "etapa teste",
      duration: 1,
      idUnit: newUnitResponse.body.idUnit,
    };

    const responseStage = await supertest(app)
      .post("/newStage")
      .send(testStage);
    expect(responseStage.status).toBe(200);

    const response = await supertest(app).get(
      `/stage/${responseStage.body.idStage}`
    );
    expect(response.status).toBe(200);
    expect(responseStage.body.name).toEqual(response.body.name);
  });

  test("status 401 if stage doesnt exist in check by id", async () => {
    const response = await supertest(app).get(`/stage/${100}`);
    expect(response.status).toBe(401);
    // expect(responseStage.body.name).toEqual(response.body.name);
  });

  test("new stages and search", async () => {
    const testUnit = {
      name: "Unidade Teste",
    };

    const newUnitResponse = await supertest(app)
      .post("/newUnit")
      .send(testUnit);
    expect(newUnitResponse.status).toBe(200);

    let stagesMock = [
      {
        name: `Etapa 1`,
        duration: 1,
        idUnit: newUnitResponse.body.idUnit,
      },
      {
        name: `Etapa 2`,
        duration: 1,
        idUnit: newUnitResponse.body.idUnit,
      },
    ];

    let allStages = [];
    for (const stage of stagesMock) {
      const testStageResponse = await supertest(app)
        .post("/newStage")
        .send(stage);
      expect(testStageResponse.status).toBe(200);
      allStages.push(testStageResponse.body);
    }
    const stagesDb = await Stage.findAll({
      where: { idUnit: newUnitResponse.body.idUnit },
    });

    for (let index = 0; index < stagesDb.length; index++) {
      expect(stagesDb[index]?.dataValues?.name).toEqual(
        stagesMock[index]?.name.toLocaleLowerCase()
      );
    }
  });

  test("new stage and find all ", async () => {
    const stagesResponse = await supertest(app)
      .get("/stages")
      .set("test", `ok`);
    expect(stagesResponse.status).toBe(200);
  });

  test("not exist this stage ", async () => {
    const stageResponse = await supertest(app).get("/stage/100");
    expect(stageResponse.status).toBe(401);
    expect(stageResponse.body.error).toEqual("Esse fluxo não existe");
  });

  test("error in create stage ", async () => {
    const testStage = {
      name: "Nova etapa",
      duration: "10",
      idUnit: "100",
    };
    const response = await supertest(app).post("/newStage").send(testStage);
    expect(response.status).toBe(400);
  });

  test("error in delete stage ", async () => {
    const stages = [
      {
        name: "Nova etapa A",
        duration: 10,
        idUnit: 1,
      },
      {
        name: "Nova etapa B",
        duration: 10,
        idUnit: 1,
      },
      {
        name: "Nova etapa C",
        duration: 10,
        idUnit: 1,
      },
    ];

    let allStages = [];
    for (const stage of stages) {
      const testStageResponse = await supertest(app)
        .post("/newStage")
        .send(stage);
      expect(testStageResponse.status).toBe(200);
      allStages.push(testStageResponse.body);
    }

    const flow = {
      name: "Fluxo ABC",
      idUnit: 1,
      sequences: [
        { from: 1, to: 2, commentary: "Primeiro" },
        { from: 2, to: 3, commentary: "Segundo" },
      ],
      idUsersToNotify: ["12345678901", "12345678909"],
    };

    const createdFlow = await supertest(app).post("/newFlow").send(flow);

    expect(createdFlow.status).toBe(200);
    const deletedStage = await supertest(app).delete(
      `/deleteStage/${allStages[0].idUnit}`
    );
    expect(deletedStage.status).toBe(409);
    expect(deletedStage.body.error).toEqual("Há fluxos utilizando esta etapa");
    expect(deletedStage.body.message).toContain(
      "Há 1 fluxos que dependem desta etapa."
    );
  });
});
