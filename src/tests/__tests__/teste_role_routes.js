import { Database } from '../TestDatabase.js';
import 'sequelize';
import supertest from "supertest";
import { app, injectDB } from "../TestApp";
import Unit from '../../models/Unit.js';

describe('role endpoints', () => {
  beforeEach(async () => {
    const database = new Database();
    await database.migrate();
    await database.seed();
    injectDB(database);
  });

  test('new role', async () => {
    const testRole = {
      name: "nome",
      accessLevel: 1,
    };

    const response = await supertest(app).post("/newRole").send(testRole);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe(testRole.name);
  });

  test('new roles and list existing', async () => {
    const testRole = [
        {
            name: "Diretor",
            accessLevel: 1,
        },
        { 
            name: "Estagiário",
            accessLevel: 4,
        }
    ]
    let allRoles = [];
    for (const role of testRole) {
        const testRoleResponse = await supertest(app).post("/newRole").send(role);
        expect(testRoleResponse.status).toBe(200);
        allRoles.push(testRoleResponse.body);
    }

    const response = await supertest(app).get("/role");
    expect(response.status).toBe(200);

    for (const role of allRoles) {
        expect(response.body.map((role) =>
          {
            return role;
          }
        )).toEqual(
            allRoles.map(roleTest => role.idRole === roleTest.idRole)
        );
      }
  });

    test('new role and check by id', async () => {
    const testRole =  { 
        name: "Estagiário",
        accessLevel: 4,
    };
    const expectedTestRole =  { 
        name: "Estagiário",
        accessLevel: 4,
    };

    const newRoleResponse = await supertest(app).post("/newRole").send(testRole);
    expect(newRoleResponse.status).toBe(200);

    const response = await supertest(app).get(`/roleAdmins/${newRoleResponse.body.idRole}`);
    expect(response.status).toBe(200);
    expect(expectedTestRole.name).toEqual(response.body.name);
  });

    test('new role and edit name', async () => {
    const testRole = {
      name: "Nome",
      accessLevel: 15
    };

    const newRoleResponse = await supertest(app).post("/newRole").send(testRole);
    expect(newRoleResponse.status).toBe(200);

    const expectedName = "Nome";

    const expecteRole = {
         name: "nota",
         accessLevel: 15
    };

    const updateResponse = await supertest(app).put(`/updateRole`).send({
         idRole: newRoleResponse.body.idRole,
         name: "nota"
    });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toEqual(expect.anything());


    expect(expecteRole.name).toEqual(updateResponse.body.name);
  });

  test('new role and delete it', async () => {
    const testRole = {
      name: "nome",
      accessLevel: 18
    };
    const expectedRole = {
      name: testRole.name,
      accessLevel: testRole.accessLevel,
    };

    const newRoleResponse = await supertest(app).post("/newRole").send(testRole);
    expect(newRoleResponse.status).toBe(200);

    const response = await supertest(app).delete("/deleteRole/").send(newRoleResponse.body);
    expect(response.status).toBe(200);
    expect(response.body.idRole).toEqual(newRoleResponse.body.idRole);
  });
  

});

    

//   test('new users and list existing', async () => {
//     const testUsers = [
//       {
//         fullName: "Francisco Duarte Lopes",
//         cpf: "75706593256",
//         email: "francisco.dl@gmail.com",
//         password: "fdl123456",
//         idUnit: 1,
//         idRole: 1
//       },
//       {
//         fullName: "Antonio Pereira Soares",
//         cpf: "70102089213",
//         email: "antps@yahoo.com",
//         password: "ffl123456",
//         idUnit: 1,
//         idRole: 2
//       },
//       {
//         fullName: "Lucas Barbosa",
//         cpf: "05363418770",
//         email: "lbarb@gmail.com",
//         password: "fd78D23456",
//         idUnit: 1,
//         idRole: 3
//       }
//     ];

//     for (const testUser of testUsers) {
//       const testUserResponse = await supertest(app).post("/newUser").send(testUser);
//       expect(testUserResponse.status).toBe(200);
//     }

//     const response = await supertest(app).get("/allUser");
//     expect(response.status).toBe(200);

//     // Include the administrator and unaccepted users in the count
//     expect(response.body.length).toBe(testUsers.length + 2);
//     for (const testUser of testUsers) {
//       expect(response.body.map((o) =>
//         {
//           o.cpf = o.cpf.toString();
//           return o;
//         }
//       )).toEqual(
//         expect.arrayContaining([
//           expect.objectContaining(testUser)
//         ])
//       );
//     }
//   });

//   test('new user and check by id', async () => {
//     const testUser = {
//       fullName: "Nome Nome",
//       cpf: "07859382903",
//       email: "aaa@bb.com",
//       password: "apw123456",
//       accepted: false,
//       idUnit: 1,
//       idRole: 2
//     };
//     const expectedTestUser = {
//       fullName: "Nome Nome",
//       cpf: "07859382903",
//       email: "aaa@bb.com",
//       accepted: false,
//       idUnit: 1,
//       idRole: 2
//     };

//     const newUserResponse = await supertest(app).post("/newUser").send(testUser);
//     expect(newUserResponse.status).toBe(200);

//     const response = await supertest(app).get(`/user/${testUser.cpf}`);
//     expect(response.status).toBe(200);
//     expect(expectedTestUser).toEqual(response.body);
//   });

//   test('try reading inexistent user', async () => {
//     const response = await supertest(app).get("/user/44061969510");
//     expect(response.status).toBe(404);
//     expect(response.body).toEqual(expect.anything());
//   });

//   test('new user and edit email', async () => {
//     const testUser = {
//       fullName: "Nomen Nomes",
//       cpf: "86891382424",
//       email: "aaa@bb.com",
//       password: "spw123456",
//       idUnit: 1,
//       idRole: 3
//     };

//     const newUserResponse = await supertest(app).post("/newUser").send(testUser);
//     expect(newUserResponse.status).toBe(200);

//     const expectedEmail = "aaaa@bbb.com.br";

//     const expectedUser = {
//       cpf: testUser.cpf,
//       email: expectedEmail,
//       accepted: false,
//       fullName: testUser.fullName,
//       idUnit: testUser.idUnit,
//       idRole: testUser.idRole
//     };

//     const updateResponse = await supertest(app).put(`/updateUser/${testUser.cpf}`).send({
//       email: expectedEmail
//     });
//     expect(updateResponse.status).toBe(200);
//     expect(updateResponse.body).toEqual(expect.anything());

//     const response = await supertest(app).get(`/user/${testUser.cpf}`);
//     expect(response.status).toBe(200);
//     expect(expectedUser).toEqual(response.body);
//     expect(response.body).toEqual(expect.objectContaining(expectedUser));
//   });

//   test('new user and edit password and login', async () => {
//     const testUser = {
//       fullName: "Nomen Nomes",
//       cpf: "86891382424",
//       email: "aaa@bb.com",
//       password: "spw123456",
//       idUnit: 1,
//       idRole: 3
//     };

//     const newUserResponse = await supertest(app).post("/newUser").send(testUser);
//     expect(newUserResponse.status).toBe(200);

//     const expectedPassword = "321TesteA";

//     const expectedUser = {
//       cpf: testUser.cpf,
//       email: testUser.email,
//       accepted: false,
//       fullName: testUser.fullName,
//       idUnit: testUser.idUnit,
//       idRole: testUser.idRole
//     };

//     const updateResponse = await supertest(app).post(`/updateUserPassword/${testUser.cpf}`).send({
//       oldPassword: testUser.password,
//       newPassword: expectedPassword
//     });
//     expect(updateResponse.status).toBe(200);
//     expect(updateResponse.body).toEqual({ message: "Usuário atualizado com sucesso!" });

//     const response = await supertest(app).post('/login').send({
//       cpf: expectedUser.cpf,
//       password: expectedPassword
//     });;
//     expect(response.status).toBe(200);
//     expect(response.body.cpf).toEqual(expectedUser.cpf);
//   });

//   test('try editing email of inexistent user', async () => {
//     const expectedUser = {
//       "cpf": '55490433353',
//       "email": 'email@email.com.mx',
//       "fullName": 'Asdfgo Iopqwerty'
//     };

//     const response = await supertest(app).put(`/updateUser/${expectedUser.cpf}`).send({
//       email: "abc@cba.edf.co"
//     });
//     expect(response.status).toBe(404);
//     expect(response.body).toEqual({error: "Usuário não existe"});
//   });

//   test('new user and delete it', async () => {
//     const testUser = {
//       fullName: "Nomenni Nomesos",
//       cpf: "26585841212",
//       email: "ala@bb.com",
//       password: "sfwJ23456",
//       idUnit: 1,
//       idRole: 5
//     };
//     const expectedUser = {
//       cpf: testUser.cpf,
//       email: testUser.email,
//       accepted: false,
//       fullName: testUser.fullName,
//       idUnit: testUser.idUnit,
//       idRole: testUser.idRole
//     };

//     const newUserResponse = await supertest(app).post("/newUser").send(testUser);
//     expect(newUserResponse.status).toBe(200);

//     const response = await supertest(app).delete(`/deleteUser/${testUser.cpf}`);
//     expect(response.status).toBe(200);
//     expect(response.body).toEqual({message: "Usuário apagado com sucesso"});

//     const checkUserResponse = await supertest(app).get(`/user/${testUser.cpf}`);
//     expect(checkUserResponse.status).toBe(404);
//     expect(checkUserResponse.body).toEqual({ error: 'Usuário não existe' });
// //   });
// });
