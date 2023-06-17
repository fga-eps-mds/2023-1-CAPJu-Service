import { Database } from "../TestDatabase.js";
import "sequelize";
import supertest from "supertest";
import { app, injectDB } from "../TestApp";
import Stage from "../../models/Stage.js";

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
});
