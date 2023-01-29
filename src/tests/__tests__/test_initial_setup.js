import { Database } from '../TestDatabase.js';
import Unit from '../../models/Unit.js';
import User from '../../models/User.js';
import Role from '../../models/Role.js';

describe('initial database', () => {
  beforeEach(async () => {
    console.log("Preparing test...");
    const database = new Database();
    await database.migrate();
    await database.seed();
    console.log("Test prepared");
	});

	test('unit exists', async () => {
		const foundUnit = await Unit.findByPk(1);
		expect(foundUnit.idUnit).toBe(1);
		expect(foundUnit.name).toBe("FGA");
	});

	test('single unit exists', async () => {
		const amount = await Unit.count();
		expect(amount).toBe(1);
	});

	test('user exists', async () => {
		const expectedCpf = '012345678901';
		const foundUser = await User.findByPk(expectedCpf);
		expect(foundUser.cpf).toBe(expectedCpf);
		expect(foundUser.idRole).toBe(5);
	});

	test('single user exists', async () => {
		const amount = await User.count();
		expect(amount).toBe(1);
	});

	test.each([
		{
			name: 'Estagiário',
			accessLevel: 1
		},
		{
			name: 'Servidor',
			accessLevel: 2
		},
		{
			name: 'Juiz',
			accessLevel: 3
		},
		{
			name: 'Diretor',
			accessLevel: 4
		},
		{
			name: 'Administrador',
			accessLevel: 5
		}
	])("role '$name' exists", async ({name, accessLevel}) => {
		const foundRoles = await Role.findAll({
			where: {
				name: name
			}
		});

		expect(foundRoles.length).toBe(1);
		expect(foundRoles).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: name
				})
			])
		);
		expect(foundRoles).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					accessLevel: accessLevel
				})
			])
		);
	});
});
