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

  test("two new flows", async () => {
    const testStages = [
      {
        name: "st0",
        duration: 1,
        idUnit: 1,
      },
      {
        name: "st1",
        duration: 2,
        idUnit: 1,
      },
      {
        name: "st2",
        duration: 3,
        idUnit: 1,
      },
    ];

    for (const testStage of testStages) {
      const newStageResponse = await supertest(app)
        .post("/newStage")
        .send(testStage);
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
            commentary: null,
          },
        ],
        idUsersToNotify: ["12345678901"],
      },
      {
        name: "flow1",
        idUnit: 1,
        sequences: [
          {
            from: 2,
            to: 3,
            commentary: null,
          },
        ],
        idUsersToNotify: ["12345678901"],
      },
    ];

    const expectedTestFlows = testFlows.map((testFlow, index) => {
      let stages = [];
      for (const { from, to } of testFlow.sequences) {
        if (!stages.includes(from)) {
          stages.push(from);
        }
        if (!stages.push(to)) {
          stages.push(to);
        }
      }
      return {
        idFlow: index + 1,
        name: testFlow.name,
        idUnit: testFlow.idUnit,
        sequences: testFlow.sequences,
        stages,
      };
    });

    for (const testFlow of testFlows) {
      const newFlowResponse = await supertest(app)
        .post("/newFlow")
        .send(testFlow);
      expect(newFlowResponse.status).toBe(200);
    }

    const flowsResponse = await supertest(app).get("/flows");
    expect(flowsResponse.status).toBe(200);
    expect(flowsResponse.body).toEqual(
      expect.arrayContaining(
        expectedTestFlows.map((expectedTestFlow) =>
          expect.objectContaining(expectedTestFlow)
        )
      )
    );

    const flowResponses = await Promise.all(
      expectedTestFlows.map(
        async ({ idFlow }) => await supertest(app).get(`/flow/${idFlow}`)
      )
    );
    flowResponses.forEach((flowResponse) =>
      expect(flowResponse.status).toBe(200)
    );
    expect(flowResponses.map(({ body }) => body)).toEqual(
      expect.arrayContaining(
        expectedTestFlows.map((expectedTestFlow) =>
          expect.objectContaining(expectedTestFlow)
        )
      )
    );
  });
});
