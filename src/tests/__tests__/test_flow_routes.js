import { Database } from "../TestDatabase.js";
import "sequelize";
import supertest from "supertest";
import { app, injectDB } from "../TestApp";

describe("flow endpoints", () => {
  beforeEach(async () => {
    const database = new Database();
    await database.migrate();
    await database.seed();
    injectDB(database);
  });

  test('two new flows', async () => {
    const testStages = [
      {
      name: "st0",
      duration: 1,
      idUnit: 1
    },{
      name: "st1",
      duration: 2,
      idUnit: 1
    }, {
      name: "st2",
      duration: 3,
      idUnit: 1
    }
    ];

    for (const testStage of testStages) {
      const newStageResponse = await supertest(app).post("/newStage").send(testStage);
      expect(newStageResponse.status).toBe(200);
    }

    const testFlows = [
      {
        name: "flow0",
        idUnit: 1,
        sequences: [
          {
            from: 1,
            to: 2,
            commentary: null
          }
        ],
        idUsersToNotify: ['12345678901']
      },{
        name: "flow1",
        idUnit: 1,
        sequences: [
          {
            from: 2,
            to: 3,
            commentary: null
          }
        ],
        idUsersToNotify: ['12345678901']
      }
    ]

    for (const testFlow of testFlows) {
      const newFlowResponse = await supertest(app).post("/newFlow").send(testFlow);
      expect(newFlowResponse.status).toBe(200);
    }
  });
});
