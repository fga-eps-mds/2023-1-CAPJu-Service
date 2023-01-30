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
    };

    const initialUnit = {
      name: "FGA"
    };

    const newUnitResponse = await supertest(app).post("/newUnit").send(testUnit);
    expect(newUnitResponse.status).toBe(200);

    const unitsResponse = await supertest(app).get("/units");
    expect(unitsResponse.status).toBe(200);

    // this unit and FGA (initial unit)
    const expectedTestUnits = [
      initialUnit,
      testUnit,
    ];

    expect(unitsResponse.body.length).toBe(2);
    expect(unitsResponse.body)
      .toEqual(expect
        .arrayContaining(expectedTestUnits
          .map((expectedTestUnit) => expect
            .objectContaining(expectedTestUnit))));
  });

  test('create unit and delete it', async () => {
    const testUnit = {
      name: "Unidade Teste"
    };

    const initialUnit = {
      name: "FGA"
    };

    const newUnitResponse = await supertest(app).post("/newUnit").send(testUnit);
    expect(newUnitResponse.status).toBe(200);


    const deleteUnitResponse = await supertest(app).delete("/deleteunit").send({ idUnit: 2 });
    expect(deleteUnitResponse.status).toBe(200);
    expect(deleteUnitResponse.body).toEqual(expect.objectContaining(testUnit));

    const unitsResponse = await supertest(app).get("/units");
    expect(unitsResponse.status).toBe(200);
    expect(unitsResponse.body.length).toBe(1);
    expect(unitsResponse.body).toEqual(expect.arrayContaining([expect.objectContaining(initialUnit)]));
  });
});
