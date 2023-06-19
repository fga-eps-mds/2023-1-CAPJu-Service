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

  test("two new flows without processes", async () => {
    const testStages = [
      { name: "st0", duration: 1, idUnit: 1 },
      { name: "st1", duration: 2, idUnit: 1 },
      { name: "st2", duration: 3, idUnit: 1 },
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
        sequences: [{ from: 1, to: 2, commentary: null }],
        idUsersToNotify: ["12345678901"],
      },
      {
        name: "flow1",
        idUnit: 1,
        sequences: [{ from: 2, to: 3, commentary: null }],
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

    /*    const flowsResponse = await supertest(app).get("/flows");
    expect(flowsResponse.status).toBe(200);
    expect(flowsResponse.body).toEqual(
      expect.arrayContaining(
        expectedTestFlows.map((expectedTestFlow) =>
          expect.objectContaining(expectedTestFlow)
        )
      )
    ); */

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

    const usersToNotifyResponses = await Promise.all(
      expectedTestFlows.map(
        async ({ idFlow }) =>
          await supertest(app).get(`/flow/${idFlow}/usersToNotify`)
      )
    );
    usersToNotifyResponses.forEach((userToNotifyResponse) =>
      expect(userToNotifyResponse.status).toBe(200)
    );
    expect(
      usersToNotifyResponses.map(({ body }) =>
        body.usersToNotify.map(({ cpf }) => cpf)
      )
    ).toEqual(
      expect.arrayContaining(
        testFlows.map((testFlow) => testFlow.idUsersToNotify)
      )
    );

    const flowSequencesResponses = await Promise.all(
      expectedTestFlows.map(
        async ({ idFlow }) =>
          await supertest(app).get(`/flowSequences/${idFlow}`)
      )
    );
    flowSequencesResponses.forEach(({ status }) => expect(status).toBe(200));
    expect(flowSequencesResponses.map(({ body }) => body)).toEqual(
      expect.arrayContaining(
        expectedTestFlows.map(({ idFlow, name, idUnit, sequences }) =>
          expect.objectContaining({ idFlow, name, idUnit, sequences })
        )
      )
    );

    const flowStageResponse = await supertest(app).get("/flowStages");
    expect(flowStageResponse.status).toBe(200);
    expect(
      flowStageResponse.body.map(({ idStageA, commentary, idStageB }) => ({
        idStageA,
        commentary,
        idStageB,
      }))
    ).toEqual(
      expectedTestFlows
        .flatMap(({ sequences }) => sequences)
        .map(({ from: idStageA, commentary, to: idStageB }) =>
          expect.objectContaining({ idStageA, commentary, idStageB })
        )
    );

    const record = 1;
    const expectedFlowsByRecord = {
      error: "Não há fluxos com esse processo",
      message: `Não há fluxos com o processo '${record}'`,
    };
    const flowsByRecordResponse = await supertest(app).get(
      `/flows/process/${record}`
    );
    expect(flowsByRecordResponse.status).toBe(404);
    expect(flowsByRecordResponse.body).toEqual(expectedFlowsByRecord);
  });

  test("Create flow and delete a stage", async () => {
    const testStages = [
      { name: "st0", duration: 1, idUnit: 1 },
      { name: "st1", duration: 2, idUnit: 1 },
      { name: "st2", duration: 3, idUnit: 1 },
      { name: "st3", duration: 4, idUnit: 1 },
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
          { from: 1, to: 2, commentary: null },
          { from: 2, to: 3, commentary: null },
          { from: 3, to: 4, commentary: null },
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
    /* 
    const flowsResponse = await supertest(app).get("/flows");
    expect(flowsResponse.status).toBe(200);
    expect(flowsResponse.body).toEqual(
      expect.arrayContaining(
        expectedTestFlows.map((expectedTestFlow) =>
          expect.objectContaining(expectedTestFlow)
        )
      )
    ); */

    const deletedStage = { from: 2, to: 3, commentary: null };

    const testFlowsDeletedStage = [
      {
        name: "flow0",
        idUnit: 1,
        sequences: [
          { from: 1, to: 2, commentary: null },
          { from: 3, to: 4, commentary: null },
        ],
        idUsersToNotify: ["12345678901"],
      },
    ];

    const expectedTestFlowsDeletedStage = testFlowsDeletedStage.map(
      (testFlow, index) => {
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
      }
    );

    const deleteStageResponse = await supertest(app).delete(
      `/flow/1/${deletedStage.from}/${deletedStage.to}`
    );
    expect(deleteStageResponse.status).toBe(200);
    expect(deleteStageResponse.body).toEqual({
      message: `Desassociação entre fluxo '1' e etapas '${deletedStage.from}' e '${deletedStage.to}' concluída`,
    });
  });

  test("Try deleting an inexistent flow", async () => {
    const deleteFlowResponse = await supertest(app).delete("/flow/1");
    expect(deleteFlowResponse.status).toBe(404);
    expect(deleteFlowResponse.body).toEqual({
      message: "Fluxo não encontrado",
    });
  });

  test("Delete flows", async () => {
    const testStages = [
      { name: "st0", duration: 1, idUnit: 1 },
      { name: "st1", duration: 2, idUnit: 1 },
      { name: "st2", duration: 3, idUnit: 1 },
      { name: "st3", duration: 4, idUnit: 1 },
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
          { from: 1, to: 2, commentary: null },
          { from: 2, to: 3, commentary: null },
          { from: 3, to: 4, commentary: null },
        ],
        idUsersToNotify: ["12345678901"],
      },
    ];

    for (const testFlow of testFlows) {
      const newFlowResponse = await supertest(app)
        .post("/newFlow")
        .send(testFlow);
      expect(newFlowResponse.status).toBe(200);
    }

    const deletedResponse = await supertest(app).delete("/flow/1");
    expect(deletedResponse.status).toBe(200);
    expect(deletedResponse.body).toEqual({
      message: "Fluxo apagado com sucesso",
    });
    /* 
    const flowsResponse = await supertest(app).get("/flows");
    expect(flowsResponse.status).toBe(200); 
    expect(flowsResponse.body).toEqual([]);*/

    const flowResponse = await supertest(app).get("/flow/1");
    expect(flowResponse.status).toBe(404);
    expect(flowResponse.body).toEqual({ message: "Não há fluxo '1'" });
  });

  test("Try updating a flow", async () => {
    const testStages = [
      { name: "st0", duration: 1, idUnit: 1 },
      { name: "st1", duration: 2, idUnit: 1 },
      { name: "st2", duration: 3, idUnit: 1 },
      { name: "st3", duration: 4, idUnit: 1 },
      { name: "st4", duration: 5, idUnit: 1 },
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
          { from: 1, to: 2, commentary: null },
          { from: 2, to: 3, commentary: null },
          { from: 3, to: 4, commentary: null },
          { from: 4, to: 5, commentary: null },
        ],
        idUsersToNotify: ["12345678901"],
      },
    ];

    for (const testFlow of testFlows) {
      const newFlowResponse = await supertest(app)
        .post("/newFlow")
        .send(testFlow);
      expect(newFlowResponse.status).toBe(200);
    }

    const updatedName = "fluxo_0";

    const updatedTestFlows = [
      {
        idFlow: 1,
        name: updatedName,
        idUnit: 1,
        sequences: [
          { from: 1, to: 2, commentary: "12" },
          { from: 2, to: 3, commentary: "23" },
          { from: 3, to: 4, commentary: "34" },
          { from: 4, to: 5, commentary: "45" },
        ],
        idUsersToNotify: ["12345678901"],
      },
    ];

    const expectedTestFlows = updatedTestFlows.map((testFlow, index) => {
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

    for (const flow of updatedTestFlows) {
      const updateResponse = await supertest(app).put("/flow").send(flow);
      expect(updateResponse.status).toBe(200);
    }

    /* const flowsResponse = await supertest(app).get("/flows");
    expect(flowsResponse.status).toBe(200);
    expect(flowsResponse.body).toEqual(
      expect.arrayContaining(
        expectedTestFlows.map((expectedTestFlow) =>
          expect.objectContaining(expectedTestFlow)
        )
      )
    ); */
  });
});
