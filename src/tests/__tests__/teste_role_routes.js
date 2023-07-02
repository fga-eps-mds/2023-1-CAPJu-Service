import { Database } from "../TestDatabase.js";
import "sequelize";
import supertest from "supertest";
import { app, injectDB } from "../TestApp";

describe("role endpoints", () => {
  beforeEach(async () => {
    const database = new Database();
    await database.migrate();
    await database.seed();
    injectDB(database);
  });

  test("new role", async () => {
    const testRole = {
      name: "nome",
      accessLevel: 1,
    };

    const response = await supertest(app).post("/newRole").send(testRole);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe(testRole.name);
  });

  test("new roles and list existing", async () => {
    const testRole = [
      {
        name: "Diretor",
        accessLevel: 1,
      },
      {
        name: "Estagiário",
        accessLevel: 4,
      },
    ];
    let allRoles = [];
    for (const role of testRole) {
      const testRoleResponse = await supertest(app).post("/newRole").send(role);
      expect(testRoleResponse.status).toBe(200);
      allRoles.push(testRoleResponse.body);
    }

    const response = await supertest(app).get("/role");
    expect(response.status).toBe(200);

    expect(response.body).toEqual(
      expect.arrayContaining(
        allRoles.map((role) => {
          return expect.objectContaining(role);
        })
      )
    );
  });

  test("new role and check by id", async () => {
    const testRole = {
      name: "Estagiário",
      accessLevel: 4,
    };
    const expectedTestRole = {
      name: "Estagiário",
      accessLevel: 4,
    };

    const newRoleResponse = await supertest(app)
      .post("/newRole")
      .send(testRole);
    expect(newRoleResponse.status).toBe(200);

    const response = await supertest(app).get(
      `/roleAdmins/${newRoleResponse.body.idRole}`
    );
    expect(response.status).toBe(200);
    expect(expectedTestRole.name).toEqual(response.body.name);
  });

  test("new role and edit name", async () => {
    const testRole = {
      name: "Nome",
      accessLevel: 15,
    };

    const newRoleResponse = await supertest(app)
      .post("/newRole")
      .send(testRole);
    expect(newRoleResponse.status).toBe(200);

    const expectedName = "Nome";

    const expecteRole = {
      name: "nota",
      accessLevel: 15,
    };

    const updateResponse = await supertest(app).put(`/updateRole`).send({
      idRole: newRoleResponse.body.idRole,
      name: "nota",
    });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toEqual(expect.anything());

    expect(expecteRole.name).toEqual(updateResponse.body.name);
  });

  test("new role and delete it", async () => {
    const testRole = {
      name: "nome",
      accessLevel: 18,
    };
    const expectedRole = {
      name: testRole.name,
      accessLevel: testRole.accessLevel,
    };

    const newRoleResponse = await supertest(app)
      .post("/newRole")
      .send(testRole);
    expect(newRoleResponse.status).toBe(200);

    const response = await supertest(app)
      .delete("/deleteRole/")
      .send(newRoleResponse.body);
    expect(response.status).toBe(200);
    expect(response.body.idRole).toEqual(newRoleResponse.body.idRole);
  });
});
