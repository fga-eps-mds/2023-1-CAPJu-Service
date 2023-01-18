import 'sequelize';
const { execSync } = require("child_process");
import supertest from "supertest";
import app from "../../app";
import Unit from '../../models/Unit.js';

describe('user endpoints', () => {
	beforeAll(() => {
		console.log("Preparing test...");
		execSync("yarn test-shred");
		execSync("yarn test-migration");
		execSync("yarn test-seed");
		console.log("Test prepared");
	});

	const testUser = {
		fullName: "nome",
                cpf: "12345678912",
                email: "aa@bb.com",
                password: "pw123456",
                idUnit: 1,
                idRole: 1
	};

	test('new user', async () => {
		const response = await supertest(app).post("/newUser").send(testUser);
		expect(response.status).toBe(200);
		expect(response.body.fullName).toBe(testUser.fullName);
	});
});
