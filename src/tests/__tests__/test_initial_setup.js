import Database from '../../database/index.js';
const { execSync } = require("child_process");
import Unit from '../../models/Unit.js';

describe('initial database', () => {
	beforeAll(() => {
		console.log("Preparing test...");
		execSync("yarn test-shred");
		execSync("yarn test-migration");
		execSync("yarn test-seed");
		console.log("Test prepared");
	});

	test('unit exists', async () => {
		const foundUnit = await Unit.findByPk(1);
		console.log(foundUnit);
		expect(foundUnit.idUnit).toBe(1);
		expect(foundUnit.name).toBe("FGA");
	});

	test('single unit exists', async () => {
		const amount = await Unit.count();
		expect(amount).toBe(1);
	});
});
