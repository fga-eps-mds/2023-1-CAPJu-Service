import { Database } from "../TestDatabase.js";
import "sequelize";
import supertest from "supertest";
import { app, injectDB } from "../TestApp";
import Unit from "../../models/Unit.js";
import { ROLE } from "../../schemas/role.js";

describe("unit endpoints", () => {
  beforeEach(async () => {
    const database = new Database();
    await database.migrate();
    await database.seed();
    injectDB(database);
  });

  test("new unit and list", async () => {
    const testUnit = {
      name: "Unidade Teste",
    };

    const initialUnit = {
      name: "FGA",
    };

    const newUnitResponse = await supertest(app)
      .post("/newUnit")
      .send(testUnit);
    expect(newUnitResponse.status).toBe(200);

    const unitsResponse = await supertest(app).get("/units");
    expect(unitsResponse.status).toBe(200);

    // this unit and FGA (initial unit)
    const expectedTestUnits = [initialUnit, testUnit];

    expect(unitsResponse.body.length).toBe(2);
    expect(unitsResponse.body).toEqual(
      expect.arrayContaining(
        expectedTestUnits.map((expectedTestUnit) =>
          expect.objectContaining(expectedTestUnit)
        )
      )
    );
  });

  test("create unit and delete it", async () => {
    const testUnit = {
      name: "Unidade Teste",
    };

    const initialUnit = {
      name: "FGA",
    };

    const newUnitResponse = await supertest(app)
      .post("/newUnit")
      .send(testUnit);
    expect(newUnitResponse.status).toBe(200);

    const deleteUnitResponse = await supertest(app)
      .delete("/deleteunit")
      .send({ idUnit: 2 });
    expect(deleteUnitResponse.status).toBe(200);
    expect(deleteUnitResponse.body).toEqual(expect.objectContaining(testUnit));

    const unitsResponse = await supertest(app).get("/units");
    expect(unitsResponse.status).toBe(200);
    expect(unitsResponse.body.length).toBe(1);
    expect(unitsResponse.body).toEqual(
      expect.arrayContaining([expect.objectContaining(initialUnit)])
    );
  });

  test("update initial unit", async () => {
    const initialUnit = {
      idUnit: 1,
      name: "FGA",
    };
    const expectedName = "Gama";
    const expectedUnit = {
      idUnit: initialUnit.idUnit,
      name: expectedName,
    };

    const updateUnitResponse = await supertest(app).put("/updateUnit").send({
      idUnit: initialUnit.idUnit,
      name: expectedName,
    });
    expect(updateUnitResponse.status).toBe(200);
    expect(updateUnitResponse.body).toEqual(
      expect.objectContaining(expectedUnit)
    );
  });

  test("create user and accept and add it as administrator of the default unit", async () => {
    const testUser = {
      fullName: "Francisco Duarte Lopes",
      cpf: "75706593256",
      email: "francisco.dl@gmail.com",
      password: "fdl123456",
      idUnit: 1,
      idRole: 1,
    };

    const expectedTestUser = {
      fullName: testUser.fullName,
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: true,
      idUnit: testUser.idUnit,
      idRole: ROLE.ADMINISTRADOR,
    };
    const testUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(testUserResponse.status).toBe(200);

    const acceptResponse = await supertest(app).post(
      `/acceptRequest/${testUser.cpf}`
    );
    expect(acceptResponse.status).toBe(200);
    expect(acceptResponse.body).toEqual({
      message: "Usuário aceito com sucesso",
    });

    const setUserResponse = await supertest(app).put("/setUnitAdmin").send({
      idUnit: testUser.idUnit,
      cpf: testUser.cpf,
    });
    expect(setUserResponse.status).toBe(200);
    expect(setUserResponse.body).toEqual(
      expect.objectContaining(expectedTestUser)
    );
  });
});
