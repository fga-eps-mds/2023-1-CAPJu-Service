import { Database } from "../TestDatabase.js";
import "sequelize";
import { Op } from "sequelize";
import supertest from "supertest";
import { app, injectDB } from "../TestApp";
import User from "../../models/User.js";
import { tokenToUser } from "../../middleware/authMiddleware.js";
import jwt from "jsonwebtoken";

let where;

describe("user endpoints", () => {
  beforeEach(async () => {
    const database = new Database();
    await database.migrate();
    await database.seed();
    injectDB(database);
  });

  test("new user", async () => {
    const testUser = {
      fullName: "nome",
      cpf: "12345678912",
      email: "aa@bb.com",
      password: "pw123456",
      idUnit: 1,
      idRole: 1,
    };

    const response = await supertest(app).post("/newUser").send(testUser);
    expect(response.status).toBe(200);
    expect(response.body.fullName).toBe(testUser.fullName);
  });

  test("new users and list existing", async () => {
    let testUsers = [
      {
        fullName: "Francisco Duarte Lopes",
        cpf: `75706593256`,
        email: "francisco.dl@gmail.com",
        password: "fdl123456",
        idUnit: 1,
        idRole: 1,
      },
      {
        fullName: "Antonio Pereira Soares",
        cpf: `70102089213`,
        email: "antps@yahoo.com",
        password: "ffl123456",
        idUnit: 1,
        idRole: 2,
      },
      {
        fullName: "Lucas Barbosa",
        cpf: `05363418770`,
        email: "lbarb@gmail.com",
        password: "fd78D23456",
        idUnit: 1,
        idRole: 3,
      },
    ];

    const expectedTestUsers = testUsers.map((testUser) => {
      const { password, ...testUserNoPassword } = testUser;
      return {
        ...testUserNoPassword,
        accepted: false,
      };
    });

    for (const testUser of testUsers) {
      const testUserResponse = await supertest(app)
        .post("/newUser")
        .send(testUser);
      expect(testUserResponse.status).toBe(200);
    }

    const usersDb = await User.findAll({
      where,
    });

    expect(usersDb.length).toBe(testUsers.length + 2);

    expect(usersDb).toEqual(
      expect.arrayContaining(
        expectedTestUsers.map((etu) => {
          return expect.objectContaining(etu);
        })
      )
    );
  });

  test("new users and list existing accepted and unaccepted", async () => {
    const testUsers = [
      {
        fullName: "Francisco Duarte Lopes",
        cpf: "75706593256",
        email: "francisco.dl@gmail.com",
        password: "fdl123456",
        idUnit: 1,
        idRole: 1,
      },
      {
        fullName: "Antonio Pereira Soares",
        cpf: "70102089213",
        email: "antps@yahoo.com",
        password: "ffl123456",
        idUnit: 1,
        idRole: 2,
      },
      {
        fullName: "Lucas Barbosa",
        cpf: "05363418770",
        email: "lbarb@gmail.com",
        password: "fd78D23456",
        idUnit: 1,
        idRole: 3,
      },
    ];

    const adminUser = [
      {
        cpf: "12345678901",
        fullName: "Usuário Administrador Inicial",
        email: "email@email.com",
        idUnit: 1,
        accepted: true,
        idRole: 5,
      },
    ];

    for (const testUser of testUsers) {
      const testUserResponse = await supertest(app)
        .post("/newUser")
        .send(testUser);
      expect(testUserResponse.status).toBe(200);
    }

    const acceptedUsersDb = await User.findAll({
      where: { accepted: true, idRole: 5 },
    });

    // Only the administrator is accepted
    expect(acceptedUsersDb.length).toBe(1);
    expect(acceptedUsersDb[0].dataValues.cpf).toEqual(adminUser[0].cpf);

    const rejectedUsersDb = await User.findAll({
      where: { accepted: false, idRole: { [Op.ne]: 5 }, ...where },
    });

    // the three created above + initial unaccepted user
    expect(rejectedUsersDb.length).toBe(4);
  });

  test("new user and check by id", async () => {
    const testUser = {
      fullName: "Nome Nome",
      cpf: "07859382903",
      email: "aaa@bb.com",
      password: "apw123456",
      accepted: false,
      idUnit: 1,
      idRole: 2,
    };
    const expectedTestUser = {
      fullName: "Nome Nome",
      cpf: "07859382903",
      email: "aaa@bb.com",
      accepted: false,
      idUnit: 1,
      idRole: 2,
      firstLogin: true,
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(200);

    const response = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(response.status).toBe(200);
    expect(expectedTestUser).toEqual(response.body);
  });

  test("try reading inexistent user", async () => {
    const response = await supertest(app).get("/user/44061969510");
    expect(response.status).toBe(404);
    expect(response.body).toEqual(expect.anything());
  });

  test("new user and edit email", async () => {
    const testUser = {
      fullName: "Nomen Nomes",
      cpf: "86891382424",
      email: "aaa@bb.com",
      password: "spw123456",
      idUnit: 1,
      idRole: 3,
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(200);

    const expectedEmail = "aaaa@bbb.com.br";

    const expectedUser = {
      cpf: testUser.cpf,
      email: expectedEmail,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      firstLogin: true || false,
      idRole: testUser.idRole,
    };

    const updateResponse = await supertest(app)
      .put(`/updateUser/${testUser.cpf}`)
      .send({
        email: expectedEmail,
      });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toEqual(expect.anything());

    const response = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(response.status).toBe(200);
    expect(expectedUser).toEqual(response.body);
    expect(response.body).toEqual(expect.objectContaining(expectedUser));
  });

  test("new user and edit password and login", async () => {
    const testUser = {
      fullName: "Nomen Nomes",
      cpf: "86891382424",
      email: "aaa@bb.com",
      password: "spw123456",
      idUnit: 1,
      idRole: 3,
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(200);

    const expectedPassword = "321TesteA";

    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole,
      firstLogin: true || false,
    };

    const acceptResponse = await supertest(app).post(
      `/acceptRequest/${testUser.cpf}`
    );
    expect(acceptResponse.status).toBe(200);
    expect(acceptResponse.body).toEqual({
      message: "Usuário aceito com sucesso",
    });

    const updateResponse = await supertest(app)
      .post(`/updateUserPassword/${testUser.cpf}`)
      .send({
        oldPassword: testUser.password,
        newPassword: expectedPassword,
      });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toEqual({
      message: "Usuário atualizado com sucesso!",
    });

    const response = await supertest(app).post("/login").send({
      cpf: expectedUser.cpf,
      password: expectedPassword,
    });
    expect(response.status).toBe(200);
    expect(response.body.cpf).toEqual(expectedUser.cpf);
  });

  test("new user and edit role", async () => {
    const testUser = {
      fullName: "Nomen Nomes",
      cpf: "86891382424",
      email: "aaa@bb.com",
      password: "spw123456",
      idUnit: 1,
      idRole: 3,
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(200);

    const expectedRole = 4;

    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: expectedRole,
      firstLogin: true || false,
    };

    const updateResponse = await supertest(app).put(`/updateUserRole`).send({
      cpf: testUser.cpf,
      idRole: expectedRole,
    });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toEqual({
      message: "Papel atualizado com sucesso",
    });

    const response = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(response.status).toBe(200);
    expect(expectedUser).toEqual(response.body);
  });

  test("try editing email of inexistent user", async () => {
    const expectedUser = {
      cpf: "55490433353",
      email: "email@email.com.mx",
      fullName: "Asdfgo Iopqwerty",
    };

    const response = await supertest(app)
      .put(`/updateUser/${expectedUser.cpf}`)
      .send({
        email: "abc@cba.edf.co",
      });
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Usuário não existe" });
  });

  test("new user and accept and login", async () => {
    const testUser = {
      fullName: "Nomen Nomes",
      cpf: "86891382424",
      email: "aaa@bb.com",
      password: "spw123456",
      idUnit: 1,
      idRole: 3,
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(200);

    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: true,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole,
      firstLogin: true || false,
    };

    const acceptResponse = await supertest(app).post(
      `/acceptRequest/${testUser.cpf}`
    );
    expect(acceptResponse.status).toBe(200);
    expect(acceptResponse.body).toEqual({
      message: "Usuário aceito com sucesso",
    });

    const userResponse = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(userResponse.status).toBe(200);
    expect(expectedUser).toEqual(userResponse.body);

    const response = await supertest(app).post("/login").send({
      cpf: expectedUser.cpf,
      password: testUser.password,
    });
    expect(response.status).toBe(200);
    expect(response.body.cpf).toEqual(expectedUser.cpf);
  });

  test("new user and edit email", async () => {
    const testUser = {
      fullName: "Nomen Nomes",
      cpf: "86891382424",
      email: "sss@example.com",
      password: "spw123456",
      idUnit: 1,
      idRole: 3,
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(200);

    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole,
      firstLogin: true || false,
    };

    const userResponse = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(userResponse.status).toBe(200);
    expect(expectedUser).toEqual(userResponse.body);

    const response = await supertest(app)
      .put(`/updateUser/${testUser.cpf}`)
      .send({
        email: "sss@example.com",
      });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Email atualizado com sucesso",
    });
  });

  test("new user and delete inexistent user", async () => {
    const testUser = {
      fullName: "Nomenni Nomesos",
      cpf: "26585841212",
      email: "sss@example.com",
      password: "sfwJ23456",
      idUnit: 1,
      idRole: 4,
    };
    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole,
      firstLogin: true || false,
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(200);

    const response = await supertest(app).delete(`/deleteUser/12345678900`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Usuário não existe!" });
  });

  test("test", async () => {
    const testUser = {
      fullName: "Nomenni Nomesos",
      cpf: "26585841212",
      email: "testemail@example.com ",
    };
    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole,
      firstLogin: true || false,
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(500);

    const response = await supertest(app).delete(
      `/deleteRequest/${testUser.cpf}`
    );
    expect(response.status).toBe(404);
  });

  test("try editing password of inexistent user", async () => {
    const expectedUser = {
      cpf: "55490433353",
      email: "teseo@email.com",
      fullName: "Asdfgo Iopqwerty",
    };

    const response = await supertest(app)
      .post(`/updateUserPassword/${expectedUser.cpf}`)
      .send({
        email: "test@email.com",
      });
    expect(response.status).toBe(404);
  });

  test("new user tries to login", async () => {
    const testUser = {
      fullName: "Nomen Nomes",
      cpf: "86891382424",
      email: "aaa@bb.com",
      password: "spw123456",
      idUnit: 1,
      idRole: 3,
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(200);

    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole,
      firstLogin: true || false,
    };

    const userResponse = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(userResponse.status).toBe(200);
    expect(expectedUser).toEqual(userResponse.body);

    const response = await supertest(app).post("/login").send({
      cpf: expectedUser.cpf,
      password: testUser.password,
    });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Usuário não aceito",
    });
  });

  test("new user and delete it", async () => {
    const testUser = {
      fullName: "Nomenni Nomesos",
      cpf: "26585841212",
      email: "ala@bb.com",
      password: "sfwJ23456",
      idUnit: 1,
      idRole: 5,
    };
    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole,
      firstLogin: true || false,
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(200);

    const response = await supertest(app).delete(`/deleteUser/${testUser.cpf}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Usuário apagado com sucesso" });

    const checkUserResponse = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(checkUserResponse.status).toBe(404);
    expect(checkUserResponse.body).toEqual({ error: "Usuário não existe" });
  });

  test("new user and deny the request", async () => {
    const testUser = {
      fullName: "Nomenni Nomesos",
      cpf: "26585841212",
      email: "ala@bb.com",
      password: "sfwJ23456",
      idUnit: 1,
      idRole: 5,
    };
    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole,
      firstLogin: true || false,
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(200);

    const response = await supertest(app).delete(
      `/deleteRequest/${testUser.cpf}`
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Usuário não aceito foi excluído",
    });

    const checkUserResponse = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(checkUserResponse.status).toBe(404);
    expect(checkUserResponse.body).toEqual({ error: "Usuário não existe" });
  });

  test("should return 500 when trying to update a user", async () => {
    const testUser = {
      fullName: "Nomen Nomes",
      cpf: "86891382424",
      email: "www@example.com",
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(500);

    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole,
      firstLogin: true || false,
    };

    const userResponse = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(userResponse.status).toBe(404);

    const response = await supertest(app).post("/login").send({
      cpf: expectedUser.cpf,
      password: testUser.password,
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("Usuário inexistente");
    expect(response.body.error).toEqual("Usuário inexistente");
  });

  it("should return 200 when trying to update a user", async () => {
    const testUser = {
      fullName: "Nomen Nomes",
      cpf: "86891382424",
      email: "www@example.com",
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(500);

    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole,
      firstLogin: true || false,
    };

    const userResponse = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(userResponse.status).toBe(404);
    expect(expectedUser).toEqual({
      accepted: false,
      cpf: "86891382424",
      email: "www@example.com",
      fullName: "Nomen Nomes",
      idRole: undefined,
      idUnit: undefined,
      firstLogin: true || false,
    });

    const response = await supertest(app)
      .put(`/updateUser/${testUser.cpf}`)
      .send({
        fullName: "Nomen Nomes",
        cpf: "86891382424",
        email: "www@example.com",
      });
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Usuário não existe",
    });
  });

  it("should return 500 when we are listing all users", async () => {
    const testUser = {
      fullName: "Nomen Nomes",
      cpf: "86891382424",
      email: "www@example.com",
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(500);
  });

  test("test", async () => {
    const testUser = {
      cpf: "12345678901",
      password: "123Teste",
    };
    const login = await supertest(app)
      .post("/login")
      .send(testUser, tokenToUser);
    const req = {
      headers: { authorization: `Bearer ${login.body.token}` },
    };
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        // Get token from header
        const token = req.headers.authorization.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from the token
        req.user = await User.findByPk(decoded.id);
        if (req.user.accepted === false) {
          throw new Error();
        }
      } catch (error) {
        console.log(error);
      }
    }

    const stagesResponse = await supertest(app)
      .get("/allUser")
      .set("test", `ok`);
    expect(stagesResponse.status).toBe(200);
    expect(stagesResponse.body.users.length).toBe(1);
  });

  test("Get all rejected users", async () => {
    // Create a test user with accepted=false
    const testUser = {
      cpf: "98765432109",
      password: "456Teste",
      fullName: "Rejected User",
      email: "rejected@example.com",
      accepted: false,
      idUnit: 1,
      idRole: 2,
      firstLogin: true || false,
    };
    await User.create(testUser);

    // Login to get the JWT token
    const loginResponse = await supertest(app).post("/login").send({
      cpf: testUser.cpf,
      password: testUser.password,
    });
    const token = loginResponse.body.token;

    // Set the Authorization header with the JWT token
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Make the request to get all rejected users
    const response = await supertest(app)
      .get("/allUser")
      .set("test", "ok")
      .set(headers)
      .query({ accepted: false });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.users)).toBe(true);
    expect(response.body.users.length).toBe(2);
    expect(response.body.users[0].accepted).toBe(false);
  });

  test("Unauthorized access without JWT token", async () => {
    // Make the request to get all users without JWT token
    const response = await supertest(app).get("/allUser").set("test", "ok");

    expect(response.status).toBe(200);
  });

  test("Unauthorized access with invalid JWT token", async () => {
    // Set an invalid JWT token
    const headers = {
      Authorization: "Bearer invalid-token",
    };

    // Make the request to get all users with an invalid JWT token
    const response = await supertest(app)
      .get("/allUser")
      .set("test", "ok")
      .set(headers);

    expect(response.status).toBe(200);
  });

  test("new users and list existing accepted and unaccepted", async () => {
    const testUsers = [
      {
        fullName: "Francisco Duarte Lopes",
        cpf: "75706593256",
        email: "francisco.dl@gmail.com",
        password: "fdl123456",
        idUnit: 1,
        idRole: 1,
      },
      {
        fullName: "Antonio Pereira Soares",
        cpf: "70102089213",
        email: "antps@yahoo.com",
        password: "ffl123456",
        idUnit: 1,
        idRole: 2,
      },
      {
        fullName: "Lucas Barbosa",
        cpf: "05363418770",
        email: "lbarb@gmail.com",
        password: "fd78D23456",
        idUnit: 1,
        idRole: 3,
      },
    ];

    const adminUser = {
      cpf: "12345678901",
      fullName: "Usuário Administrador Inicial",
      email: "admin@example.com",
      idUnit: 1,
      accepted: true,
      idRole: 5,
    };

    for (const testUser of testUsers) {
      const testUserResponse = await supertest(app)
        .post("/newUser")
        .send(testUser);
      expect(testUserResponse.status).toBe(200);
    }

    const acceptedUsersDb = await User.findAll({
      where: {
        accepted: true,
        idRole: adminUser.idRole,
      },
    });

    // Only the administrator is accepted
    expect(acceptedUsersDb.length).toBe(1);
    expect(acceptedUsersDb[0].cpf).toEqual(adminUser.cpf);

    const rejectedUsersDb = await User.findAll({
      where: {
        accepted: false,
        idRole: {
          [Op.not]: adminUser.idRole,
        },
      },
    });

    // The three created above + initial unaccepted user
    expect(rejectedUsersDb.length).toBe(4);
  });

  it("should return error for non-existent user", async () => {
    const response = await supertest(app)
      .post("/login")
      .send({
        cpf: "cpf_inexistente",
        password: "senha_qualquer",
      })
      .expect(401);

    expect(response.body.error).toBe("Usuário inexistente");
    expect(response.body.message).toBe("Usuário inexistente");
  });

  it("should return error for wrong password", async () => {
    const testUser = {
      fullName: "Nomen Nomes",
      cpf: "86891382424",
      email: "aaa@bb.com",
      password: "spw123456",
      idUnit: 1,
      idRole: 3,
    };

    await supertest(app).post("/newUser").send(testUser);

    await supertest(app).post(`/acceptRequest/${testUser.cpf}`);

    const response = await supertest(app)
      .post("/login")
      .send({
        cpf: testUser.cpf,
        password: "senha_qualquer",
      })
      .expect(401);

    expect(response.body.message).toBe("Senha ou usuário incorretos");
    expect(response.body.error).toBe("Impossível autenticar");
  });

  test("get all users", async () => {
    const testUser = {
      fullName: "Nomenni Nomesos",
      cpf: "26585841212",
      email: "email@gmail.com",
    };
    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole,
    };

    const userResponse = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(userResponse.status).toBe(404);
    expect(expectedUser).toEqual({
      accepted: false,
      fullName: "Nomenni Nomesos",
      cpf: "26585841212",
      email: "email@gmail.com",
      idRole: undefined,
      idUnit: undefined,
    });
    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(500);

    const response = await supertest(app).get("/allUser");
    expect(response.status).toBe(500);

    const deleteUserResponse = await supertest(app).delete(
      `/deleteUser/${testUser.cpf}`
    );
    expect(deleteUserResponse.status).toBe(404);
  });

  it("should return the total count and total pages for accepted users", async () => {
    const response = await supertest(app)
      .get("/allUser?accepted=true")
      .set("test", "ok")
      .expect(200);
  });
  it("login without initial users ", async () => {
    const testUser = {
      fullName: "Nome Nome",
      cpf: "07859382903",
      email: "aaa@bb.com",
      password: "apw123456",
      accepted: false,
      idUnit: 1,
      idRole: 2,
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);
    expect(newUserResponse.status).toBe(200);

    const userAccepted = await supertest(app)
      .post(`/acceptRequest/${testUser.cpf}`)
      .send({
        cpf: testUser.cpf,
        password: testUser.password,
      });

    const response = await supertest(app).post("/login").send({
      cpf: testUser.cpf,
      password: testUser.password,
    });
    expect(response.status).toBe(200);
  });

  it("user already exists", async () => {
    const testUser = {
      fullName: "Nome Nome",
      cpf: "12345678901",
      email: "aaa@bb.com",
      password: "apw123456",
      accepted: false,
      idUnit: 1,
      idRole: 2,
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);

    expect(newUserResponse.status).toBe(400);
    expect(newUserResponse.body.error).toEqual("Campo duplicado.");
    expect(newUserResponse.body.message).toEqual(
      "Este CPF já foi cadastrado na plataforma."
    );
  });

  it("error in update user role", async () => {
    const testUser = {
      cpf: "12345678905",
      idRole: 2,
    };

    const newUserResponse = await supertest(app)
      .put("/updateUserRole")
      .send(testUser);

    expect(newUserResponse.status).toBe(404);
    expect(newUserResponse.body.error).toEqual("Usuário não existe");
  });

  it("error in update user password", async () => {
    const testUser = {
      fullName: "Nome Nome",
      cpf: "12345678905",
      email: "aaa@bb.com",
      password: "apw123456",
      accepted: false,
      idUnit: 1,
      idRole: 2,
    };

    const newPassword = {
      oldPassword: "apw1234567",
      newPassword: "apw12345678910",
    };

    const newUserResponse = await supertest(app)
      .post("/newUser")
      .send(testUser);

    const newPasswordResponse = await supertest(app)
      .post(`/updateUserPassword/${testUser.cpf}`)
      .send(newPassword);

    expect(newPasswordResponse.status).toBe(400);
    expect(newPasswordResponse.body.message).toEqual("Senha inválida!");
  });
  it("error accepted request ", async () => {
    const testUser = {
      cpf: "12345678905",
    };

    const newRequestResponse = await supertest(app)
      .post(`/acceptRequest/${testUser.cpf}`)
      .send(testUser);
    expect(newRequestResponse.status).toBe(404);
    expect(newRequestResponse.body.error).toEqual("Usuário não existe");
  });
  it("update user email and password", async () => {
    const cpf = "12345678901";
    const testUser = {
      email: "novoemail@email.com",
      password: "1234Teste",
    };

    const newPasswordAndEmailResponse = await supertest(app)
      .put(`/updateUserEmailAndPassword/${cpf}`)
      .send(testUser);

    console.log("first", newPasswordAndEmailResponse.body);

    expect(newPasswordAndEmailResponse.status).toBe(200);
  });
});
