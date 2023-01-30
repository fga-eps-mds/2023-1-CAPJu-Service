import { Database } from '../TestDatabase.js';
import 'sequelize';
import supertest from "supertest";
import { app, injectDB } from "../TestApp";
import Unit from '../../models/Unit.js';

describe('unit endpoints', () => {
  beforeEach(async () => {
    const database = new Database();
    await database.migrate();
    await database.seed();
    injectDB(database);
  });

  test('new unit and list', async () => {
    const testUnit = {
      name: "Unidade Teste"
    }

    const newUnitResponse = await supertest(app).post("/newUnit").send(testUnit);
    expect(newUnitResponse.status).toBe(200);

    //const unitsResponse = await supertest
  });
});
