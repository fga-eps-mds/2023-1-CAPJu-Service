import { Database } from '../TestDatabase.js';
import 'sequelize';
import supertest from "supertest";
import { app, injectDB } from "../TestApp";
import Unit from '../../models/Unit.js';

describe('user endpoints', () => {
  beforeEach(async () => {
    const database = new Database();
    await database.migrate();
    await database.seed();
    injectDB(database);
  });

  test('new user', async () => {
    const testUser = {
      fullName: "nome",
      cpf: "12345678912",
      email: "aa@bb.com",
      password: "pw123456",
      idUnit: 1,
      idRole: 1
    };

    const response = await supertest(app).post("/newUser").send(testUser);
    expect(response.status).toBe(200);
    expect(response.body.fullName).toBe(testUser.fullName);
  });

  test('new users and list existing', async () => {
    const testUsers = [
      {
        fullName: "Francisco Duarte Lopes",
        cpf: "75706593256",
        email: "francisco.dl@gmail.com",
        password: "fdl123456",
        idUnit: 1,
        idRole: 1
      },
      {
        fullName: "Antonio Pereira Soares",
        cpf: "70102089213",
        email: "antps@yahoo.com",
        password: "ffl123456",
        idUnit: 1,
        idRole: 2
      },
      {
        fullName: "Lucas Barbosa",
        cpf: "05363418770",
        email: "lbarb@gmail.com",
        password: "fd78D23456",
        idUnit: 1,
        idRole: 3
      }
    ];

    const expectedTestUsers = testUsers.map((testUser) => {
      const { password, ...testUserNoPassword } = testUser;
      return {
        ...testUserNoPassword,
        accepted: false
      };
    });

    for (const testUser of testUsers) {
      const testUserResponse = await supertest(app).post("/newUser").send(testUser);
      expect(testUserResponse.status).toBe(200);
    }

    const response = await supertest(app).get("/allUser");
    expect(response.status).toBe(200);

    // Include the administrator and unaccepted users in the count
    expect(response.body.length).toBe(testUsers.length + 2);

    expect(response.body).toEqual(expect.arrayContaining(expectedTestUsers.map((etu) => {
      return expect.objectContaining(etu);
    })));
  });

  test('new users and list existing accepted and unaccepted', async () => {
    const testUsers = [
      {
        fullName: "Francisco Duarte Lopes",
        cpf: "75706593256",
        email: "francisco.dl@gmail.com",
        password: "fdl123456",
        idUnit: 1,
        idRole: 1
      },
      {
        fullName: "Antonio Pereira Soares",
        cpf: "70102089213",
        email: "antps@yahoo.com",
        password: "ffl123456",
        idUnit: 1,
        idRole: 2
      },
      {
        fullName: "Lucas Barbosa",
        cpf: "05363418770",
        email: "lbarb@gmail.com",
        password: "fd78D23456",
        idUnit: 1,
        idRole: 3
      }
    ];

    const adminUser = [{
      cpf: '12345678901',
      fullName: 'Usuário Administrador Inicial',
      email: 'email@email.com',
      idUnit: 1,
      accepted: true,
      idRole: 5,
    }];

    for (const testUser of testUsers) {
      const testUserResponse = await supertest(app).post("/newUser").send(testUser);
      expect(testUserResponse.status).toBe(200);
    }

    const responseAccepted = await supertest(app).get("/allUser?accepted=true");
    expect(responseAccepted.status).toBe(200);

    // Only the administrator is accepted
    expect(responseAccepted.body.length).toBe(1);
    expect(responseAccepted.body).toEqual(expect.arrayContaining(adminUser));

    const responseNotAccepted = await supertest(app).get("/allUser?accepted=false");
    expect(responseAccepted.status).toBe(200);

    // the three created above + initial unaccepted user
    expect(responseNotAccepted.body.length).toBe(4);
  });

  test('new user and check by id', async () => {
    const testUser = {
      fullName: "Nome Nome",
      cpf: "07859382903",
      email: "aaa@bb.com",
      password: "apw123456",
      accepted: false,
      idUnit: 1,
      idRole: 2
    };
    const expectedTestUser = {
      fullName: "Nome Nome",
      cpf: "07859382903",
      email: "aaa@bb.com",
      accepted: false,
      idUnit: 1,
      idRole: 2
    };

    const newUserResponse = await supertest(app).post("/newUser").send(testUser);
    expect(newUserResponse.status).toBe(200);

    const response = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(response.status).toBe(200);
    expect(expectedTestUser).toEqual(response.body);
  });

  test('try reading inexistent user', async () => {
    const response = await supertest(app).get("/user/44061969510");
    expect(response.status).toBe(404);
    expect(response.body).toEqual(expect.anything());
  });

  test('new user and edit email', async () => {
    const testUser = {
      fullName: "Nomen Nomes",
      cpf: "86891382424",
      email: "aaa@bb.com",
      password: "spw123456",
      idUnit: 1,
      idRole: 3
    };

    const newUserResponse = await supertest(app).post("/newUser").send(testUser);
    expect(newUserResponse.status).toBe(200);

    const expectedEmail = "aaaa@bbb.com.br";

    const expectedUser = {
      cpf: testUser.cpf,
      email: expectedEmail,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole
    };

    const updateResponse = await supertest(app).put(`/updateUser/${testUser.cpf}`).send({
      email: expectedEmail
    });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toEqual(expect.anything());

    const response = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(response.status).toBe(200);
    expect(expectedUser).toEqual(response.body);
    expect(response.body).toEqual(expect.objectContaining(expectedUser));
  });

  test('new user and edit password and login', async () => {
    const testUser = {
      fullName: "Nomen Nomes",
      cpf: "86891382424",
      email: "aaa@bb.com",
      password: "spw123456",
      idUnit: 1,
      idRole: 3
    };

    const newUserResponse = await supertest(app).post("/newUser").send(testUser);
    expect(newUserResponse.status).toBe(200);

    const expectedPassword = "321TesteA";

    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole
    };

    const acceptResponse = await supertest(app).post(`/acceptRequest/${testUser.cpf}`);
    expect(acceptResponse.status).toBe(200);
    expect(acceptResponse.body).toEqual({ message: "Usuário aceito com sucesso" });

    const updateResponse = await supertest(app).post(`/updateUserPassword/${testUser.cpf}`).send({
      oldPassword: testUser.password,
      newPassword: expectedPassword
    });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toEqual({ message: "Usuário atualizado com sucesso!" });

    const response = await supertest(app).post('/login').send({
      cpf: expectedUser.cpf,
      password: expectedPassword
    });
    expect(response.status).toBe(200);
    expect(response.body.cpf).toEqual(expectedUser.cpf);
  });

  test('new user and edit role', async () => {
    const testUser = {
      fullName: "Nomen Nomes",
      cpf: "86891382424",
      email: "aaa@bb.com",
      password: "spw123456",
      idUnit: 1,
      idRole: 3
    };

    const newUserResponse = await supertest(app).post("/newUser").send(testUser);
    expect(newUserResponse.status).toBe(200);

    const expectedRole = 4;

    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: expectedRole
    };

    const updateResponse = await supertest(app).put(`/updateUserRole`).send({
      cpf: testUser.cpf,
      idRole: expectedRole
    });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toEqual({ message: "Papel atualizado com sucesso" });

    const response = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(response.status).toBe(200);
    expect(expectedUser).toEqual(response.body);
  });

  test('try editing email of inexistent user', async () => {
    const expectedUser = {
      "cpf": '55490433353',
      "email": 'email@email.com.mx',
      "fullName": 'Asdfgo Iopqwerty'
    };

    const response = await supertest(app).put(`/updateUser/${expectedUser.cpf}`).send({
      email: "abc@cba.edf.co"
    });
    expect(response.status).toBe(404);
    expect(response.body).toEqual({error: "Usuário não existe"});
  });

  test('new user and accept and login', async () => {
    const testUser = {
      fullName: "Nomen Nomes",
      cpf: "86891382424",
      email: "aaa@bb.com",
      password: "spw123456",
      idUnit: 1,
      idRole: 3
    };

    const newUserResponse = await supertest(app).post("/newUser").send(testUser);
    expect(newUserResponse.status).toBe(200);

    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: true,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole
    };

    const updateResponse = await supertest(app).post(`/acceptRequest/${testUser.cpf}`);
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toEqual({ message: "Usuário aceito com sucesso" });

    const userResponse = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(userResponse.status).toBe(200);
    expect(expectedUser).toEqual(userResponse.body);

    const response = await supertest(app).post('/login').send({
      cpf: expectedUser.cpf,
      password: testUser.password
    });
    expect(response.status).toBe(200);
    expect(response.body.cpf).toEqual(expectedUser.cpf);
  });

  test('new user tries to login', async () => {
    const testUser = {
      fullName: "Nomen Nomes",
      cpf: "86891382424",
      email: "aaa@bb.com",
      password: "spw123456",
      idUnit: 1,
      idRole: 3
    };

    const newUserResponse = await supertest(app).post("/newUser").send(testUser);
    expect(newUserResponse.status).toBe(200);

    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole
    };

    const userResponse = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(userResponse.status).toBe(200);
    expect(expectedUser).toEqual(userResponse.body);

    const response = await supertest(app).post('/login').send({
      cpf: expectedUser.cpf,
      password: testUser.password
    });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Usuário não aceito"
    });
  });

  test('new user and delete it', async () => {
    const testUser = {
      fullName: "Nomenni Nomesos",
      cpf: "26585841212",
      email: "ala@bb.com",
      password: "sfwJ23456",
      idUnit: 1,
      idRole: 5
    };
    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole
    };

    const newUserResponse = await supertest(app).post("/newUser").send(testUser);
    expect(newUserResponse.status).toBe(200);

    const response = await supertest(app).delete(`/deleteUser/${testUser.cpf}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({message: "Usuário apagado com sucesso"});

    const checkUserResponse = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(checkUserResponse.status).toBe(404);
    expect(checkUserResponse.body).toEqual({ error: 'Usuário não existe' });
  });

  test('new user and deny the request', async () => {
    const testUser = {
      fullName: "Nomenni Nomesos",
      cpf: "26585841212",
      email: "ala@bb.com",
      password: "sfwJ23456",
      idUnit: 1,
      idRole: 5
    };
    const expectedUser = {
      cpf: testUser.cpf,
      email: testUser.email,
      accepted: false,
      fullName: testUser.fullName,
      idUnit: testUser.idUnit,
      idRole: testUser.idRole
    };

    const newUserResponse = await supertest(app).post("/newUser").send(testUser);
    expect(newUserResponse.status).toBe(200);

    const response = await supertest(app).delete(`/deleteRequest/${testUser.cpf}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({message: "Usuário não aceito foi excluído"});

    const checkUserResponse = await supertest(app).get(`/user/${testUser.cpf}`);
    expect(checkUserResponse.status).toBe(404);
    expect(checkUserResponse.body).toEqual({ error: 'Usuário não existe' });
  });
});
