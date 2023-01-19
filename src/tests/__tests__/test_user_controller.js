import 'sequelize';
const { execSync } = require("child_process");
import supertest from "supertest";
import app from "../../app";
import Unit from '../../models/Unit.js';

describe('user endpoints', () => {
	beforeEach(() => {
		console.log("Preparing test...");
		execSync("yarn test-shred");
		execSync("yarn test-migration");
		execSync("yarn test-seed");
		console.log("Test prepared");
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

		for (const testUser of testUsers) {
			const testUserResponse = await supertest(app).post("/newUser").send(testUser);
			expect(testUserResponse.status).toBe(200);
		}

		const response = await supertest(app).get("/users");
		expect(response.status).toBe(200);

		// Include the administrator user in the count
		expect(response.body.length).toBe(testUsers.length + 1);
		for (const testUser of testUsers) {
			expect(response.body.map((o) =>
				{
					o.cpf = o.cpf.toString();
					return o;
				}
			)).toEqual(
				expect.arrayContaining([
					expect.objectContaining(testUser)
				])
			);
		}
	});

	test('new user and check by id', async () => {
		const testUser = {
			fullName: "Nome Nome",
			cpf: "07859382903",
			email: "aaa@bb.com",
			password: "apw123456",
			idUnit: 1,
			idRole: 2
		};

		const newUserResponse = await supertest(app).post("/newUser").send(testUser);
		expect(newUserResponse.status).toBe(200);

		const response = await supertest(app).get("/user").send({"cpf": testUser.cpf});
		expect(response.status).toBe(200);
		expect(response.body).toEqual(expect.objectContaining(testUser));
	});

	test('new user and edit fullName', async () => {
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

		const newName = "Nomena Nomeno";

		const expectedUser = {
			"cpf": testUser.cpf,
			"email": testUser.email,
			"fullName": newName
		};

		const response = await supertest(app).put("/updateUser").send(expectedUser);
		expect(response.status).toBe(200);
		expect(response.body).toEqual(expect.objectContaining(expectedUser));
	});

	test('new user and edit email', async () => {
		const testUser = {
			fullName: "Nomenn Nomess",
			cpf: "73822307327",
			email: "aaaa@bb.com",
			password: "sfw123456",
			idUnit: 1,
			idRole: 4
		};

		const newUserResponse = await supertest(app).post("/newUser").send(testUser);
		expect(newUserResponse.status).toBe(200);

		const newEmail = "novo.email@servidor.com.br";

		const expectedUser = {
			"cpf": testUser.cpf,
			"email": newEmail,
			"fullName": testUser.fullName
		};

		const response = await supertest(app).put("/updateUser").send(expectedUser);
		expect(response.status).toBe(200);
		expect(response.body).toEqual(expect.objectContaining(expectedUser));
	});
});
