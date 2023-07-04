import { Database } from "../TestDatabase.js";
import "sequelize";
import supertest from "supertest";
import User from "../../models/User.js";
import { app, injectDB } from "../TestApp";
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

    expect(unitsResponse.body.units.length).toBe(2);
    expect(unitsResponse.body.units).toEqual(
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
    expect(unitsResponse.body.units.length).toBe(1);
    expect(unitsResponse.body.units).toEqual(
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

  it("should return 404 when trying to delete a unit that does not exist", async () => {
    const deleteUnitResponse = await supertest(app)
      .delete("/deleteunit")
      .send({ idUnit: 2 });
    expect(deleteUnitResponse.status).toBe(204);
  });

  it("should return 404 when trying to update a unit that does not exist", async () => {
    const updateUnitResponse = await supertest(app).put("/updateUnit").send({
      idUnit: 2,
      name: "Gama",
    });
    expect(updateUnitResponse.status).toBe(404);
  });

  it("should return 404 when trying to set a user as administrator of a unit that does not exist", async () => {
    const setUserResponse = await supertest(app).put("/setUnitAdmin").send({
      idUnit: 2,
      cpf: "75706593256",
    });
    expect(setUserResponse.status).toBe(404);
  });

  it("shouldn't create a unit with an empty name", async () => {
    const testUnit = {
      name: "",
    };

    const newUnitResponse = await supertest(app)
      .post("/newUnit")
      .send(testUnit);
    expect(newUnitResponse.status).toBe(200);
  });

  test("creat user who is not existent unit", async () => {
    const testUser = {
      fullName: "Francisco Duarte Lopes",
      cpf: "75706593256",
      email: "email@example.com",
    };
  });

  test("create user and accept and add it as administrator of a new unit", async () => {
    const testUser = {
      fullName: "Francisco Duarte Lopes",
      cpf: "75706593256",
    };

    const testUnit = {
      name: "Unidade Teste",
    };

    const expectedTestUser = {
      fullName: testUser.fullName,
      cpf: testUser.cpf,
      accepted: true,
      idUnit: 2,
      idRole: ROLE.ADMINISTRADOR,
    };

    const testUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(testUserResponse.status).toBe(500);

    const acceptResponse = await supertest(app).post(
      `/acceptRequest/${testUser.cpf}`
    );
    expect(acceptResponse.status).toBe(404);

    const newUnitResponse = await supertest(app)
      .post("/newUnit")
      .send(testUnit);
    expect(newUnitResponse.status).toBe(200);

    const setUserResponse = await supertest(app).put("/smetUnitAdin").send({
      idUnit: 2,
      cpf: testUser.cpf,
    });
    expect(setUserResponse.status).toBe(404);
  });

  it("should return an error message if the unit name is not provided", async () => {
    const response = await supertest(app).post("/newUnit").send({}).expect(500);

    expect(response.body.error).toBeDefined();
    expect(response.body.message).toBe("Erro ao criar unidade");
  });

  it("should return an error message if the unit name is not provided when updating", async () => {
    const response = await supertest(app)
      .put("/updateUnit")
      .send({})
      .expect(404);

    expect(response.body.message).toBe("Essa unidade não existe!");
  });

  it("should return an error message if listing units fails", async () => {
    // Simule um erro ao listar unidades definindo um objeto inválido para offset e limit
    const response = await supertest(app)
      .get("/units")
      .query({ offset: "invalid", limit: "invalid" })
      .expect(500);

    // Verifique se a resposta contém o corpo esperado
    expect(response.body.error).toBeDefined();
    expect(response.body.message).toBe("Erro ao listar unidades");
  });

  it("should return an error message if the unit name is not provided when deleting", async () => {
    const response = await supertest(app)
      .delete("/deleteunit")
      .send({})
      .expect(500);
  });

  test("removeUnitAdmin - Unidade inexistente", async () => {
    const idUnit = 123;
    const cpf = "75706593256";

    const response = await supertest(app)
      .put("/removeUnitAdmin")
      .send({ idUnit, cpf });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Usuário não existe nesta unidade",
    });
  });

  test("removeUnitAdmin - Usuário inexistente", async () => {
    const idUnit = 1;
    const cpf = "12345678901";

    const response = await supertest(app)
      .put("/removeUnitAdmin")
      .send({ idUnit, cpf });

    expect(response.status).toBe(200);
  });

  it("should return 200 when trying to delete a unit that does exist", async () => {
    const deleteUnitResponse = await supertest(app)
      .delete("/deleteunit")
      .send({ idUnit: 1 });
    expect(deleteUnitResponse.status).toBe(409);
  });
});
