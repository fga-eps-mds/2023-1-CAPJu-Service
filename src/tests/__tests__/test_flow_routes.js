import { Database } from "../TestDatabase.js";
import "sequelize";
import supertest from "supertest";
import { app, injectDB } from "../TestApp";
import Flow from "../../models/Flow.js";
import Process from "../../models/Process.js";
import FlowProcess from "../../models/FlowProcess.js";

describe("flow endpoints", () => {
  beforeEach(async () => {
    const database = new Database();
    await database.migrate();
    await database.seed();
    injectDB(database);
  });

  test("new flow", async () => {
    const flowData = {
      name: "Fluxo AB",
      idUnit: 1,
      sequences: [
        { from: 1, to: 2, commentary: "Primeiro Comentário" },
        { from: 2, to: 3, commentary: "Segundo Comentário" },
      ],
      idUsersToNotify: ["12345678901", "12345678909"],
    };

    const newFlowResponse = await supertest(app)
      .post("/newFlow")
      .send(flowData);

    expect(newFlowResponse.status).toBe(200);

    const createdFlow = await supertest(app).get(
      `/flow/${newFlowResponse.body.idFlow}`
    );

    expect(newFlowResponse.body.idFlow).toEqual(createdFlow.body.idFlow);
    expect(newFlowResponse.body.name).toEqual(createdFlow.body.name);
    expect(newFlowResponse.body.idUnit).toEqual(createdFlow.body.idUnit);
    expect(newFlowResponse.body.sequences).toEqual(createdFlow.body.sequences);
  });

  test("get flow by id", async () => {
    const idFlow = 1;
    const flowResponse = await supertest(app).get(`/flow/${idFlow}`);

    expect(flowResponse.status).toBe(200);
    expect(flowResponse.body.idFlow).toBe(idFlow);
  });

  test("get all flows", async () => {
    const flows = await Flow.findAll();
    flows.forEach((flow) => {
      expect(flow.dataValues).toHaveProperty("idFlow");
      expect(flow.dataValues).toHaveProperty("name");
      expect(flow.dataValues).toHaveProperty("idUnit");
      expect(flow.dataValues).toHaveProperty("createdAt");
      expect(flow.dataValues).toHaveProperty("updatedAt");
    });
  });

  test("get by id with sequence", async () => {
    const idFlow = 1;
    const flows = await supertest(app).get(`/flowSequences/${idFlow}`);
    expect(flows.status).toBe(200);
    expect(flows.body).toHaveProperty("idFlow");
    expect(flows.body).toHaveProperty("name");
    expect(flows.body).toHaveProperty("idUnit");
    expect(flows.body).toHaveProperty("sequences");
  });

  test("get flow by process record", async () => {
    const testProcess = {
      record: "12345678901234567899",
      idUnit: 1,
      priority: 0,
      idFlow: 1,
      nickname: "Meu Primeiro Processo",
    };

    const newProcessResponse = await supertest(app)
      .post("/newProcess")
      .send(testProcess);

    expect(newProcessResponse.status).toBe(200);

    const flows = await supertest(app).get(
      `/flows/process/${newProcessResponse.body.flowProcess.record}`
    );
    expect(flows.status).toBe(200);

    flows.body.forEach((flow) => {
      expect(flow).toHaveProperty("idFlowProcess");
      expect(flow).toHaveProperty("idFlow");
      expect(flow).toHaveProperty("record");
      expect(flow).toHaveProperty("finalised");
      expect(flow).toHaveProperty("createdAt");
      expect(flow).toHaveProperty("updatedAt");
      expect(flow.record).toEqual(newProcessResponse.body.flowProcess.record);
    });
  });

  test("get all flow stages", async () => {
    const flowStagesResponse = await supertest(app).get("/flowStages");

    expect(flowStagesResponse.status).toBe(200);
    flowStagesResponse.body.forEach((flowStage) => {
      expect(flowStage).toHaveProperty("idFlowStage");
      expect(flowStage).toHaveProperty("idStageA");
      expect(flowStage).toHaveProperty("idStageB");
      expect(flowStage).toHaveProperty("idFlow");
      expect(flowStage).toHaveProperty("commentary");
      expect(flowStage).toHaveProperty("createdAt");
      expect(flowStage).toHaveProperty("updatedAt");
    });
  });

  test("get users to notify", async () => {
    const flowData = {
      name: "Fluxo AB",
      idUnit: 1,
      sequences: [
        { from: 1, to: 2, commentary: "Primeiro Comentário" },
        { from: 2, to: 3, commentary: "Segundo Comentário" },
      ],
      idUsersToNotify: ["12345678901", "12345678909"],
    };

    const newFlowResponse = await supertest(app)
      .post("/newFlow")
      .send(flowData);

    expect(newFlowResponse.status).toBe(200);
    const usersToNotifyResponse = await supertest(app).get(
      `/flow/${newFlowResponse.body.idFlow}/usersToNotify`
    );
    expect(usersToNotifyResponse.status).toBe(200);
    usersToNotifyResponse.body.usersToNotify.forEach((user) => {
      expect(user).toHaveProperty("idFlow");
      expect(user).toHaveProperty("cpf");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("idFlow");
      expect(user).toHaveProperty("idUnit");
    });
  });

  // test("two new flows without processes", async () => {
  //   const testStages = [
  //     { name: "st0", duration: 1, idUnit: 1 },
  //     { name: "st1", duration: 2, idUnit: 1 },
  //     { name: "st2", duration: 3, idUnit: 1 },
  //   ];

  //   for (const testStage of testStages) {
  //     const newStageResponse = await supertest(app)
  //       .post("/newStage")
  //       .send(testStage);
  //     expect(newStageResponse.status).toBe(200);
  //   }

  //   const testFlows = [
  //     {
  //       name: "flow0",
  //       idUnit: 1,
  //       sequences: [{ from: 1, to: 2, commentary: null }],
  //       idUsersToNotify: ["12345678901"],
  //     },
  //     {
  //       name: "flow1",
  //       idUnit: 1,
  //       sequences: [{ from: 2, to: 3, commentary: null }],
  //       idUsersToNotify: ["12345678901"],
  //     },
  //   ];

  //   const expectedTestFlows = testFlows.map((testFlow, index) => {
  //     let stages = [];
  //     for (const { from, to } of testFlow.sequences) {
  //       if (!stages.includes(from)) {
  //         stages.push(from);
  //       }
  //       if (!stages.push(to)) {
  //         stages.push(to);
  //       }
  //     }
  //     return {
  //       idFlow: index + 1,
  //       name: testFlow.name,
  //       idUnit: testFlow.idUnit,
  //       sequences: testFlow.sequences,
  //       stages,
  //     };
  //   });

  //   for (const testFlow of testFlows) {
  //     const newFlowResponse = await supertest(app)
  //       .post("/newFlow")
  //       .send(testFlow);
  //     expect(newFlowResponse.status).toBe(200);
  //   }

  //   /*    const flowsResponse = await supertest(app).get("/flows");
  //   expect(flowsResponse.status).toBe(200);
  //   expect(flowsResponse.body).toEqual(
  //     expect.arrayContaining(
  //       expectedTestFlows.map((expectedTestFlow) =>
  //         expect.objectContaining(expectedTestFlow)
  //       )
  //     )
  //   ); */

  //   const flowResponses = await Promise.all(
  //     expectedTestFlows.map(
  //       async ({ idFlow }) => await supertest(app).get(`/flow/${idFlow}`)
  //     )
  //   );
  //   flowResponses.forEach((flowResponse) =>
  //     expect(flowResponse.status).toBe(200)
  //   );
  //   expect(flowResponses.map(({ body }) => body)).toEqual(
  //     expect.arrayContaining(
  //       expectedTestFlows.map((expectedTestFlow) =>
  //         expect.objectContaining(expectedTestFlow)
  //       )
  //     )
  //   );

  //   const usersToNotifyResponses = await Promise.all(
  //     expectedTestFlows.map(
  //       async ({ idFlow }) =>
  //         await supertest(app).get(`/flow/${idFlow}/usersToNotify`)
  //     )
  //   );
  //   usersToNotifyResponses.forEach((userToNotifyResponse) =>
  //     expect(userToNotifyResponse.status).toBe(200)
  //   );
  //   expect(
  //     usersToNotifyResponses.map(({ body }) =>
  //       body.usersToNotify.map(({ cpf }) => cpf)
  //     )
  //   ).toEqual(
  //     expect.arrayContaining(
  //       testFlows.map((testFlow) => testFlow.idUsersToNotify)
  //     )
  //   );

  //   const flowSequencesResponses = await Promise.all(
  //     expectedTestFlows.map(
  //       async ({ idFlow }) =>
  //         await supertest(app).get(`/flowSequences/${idFlow}`)
  //     )
  //   );
  //   flowSequencesResponses.forEach(({ status }) => expect(status).toBe(200));
  //   expect(flowSequencesResponses.map(({ body }) => body)).toEqual(
  //     expect.arrayContaining(
  //       expectedTestFlows.map(({ idFlow, name, idUnit, sequences }) =>
  //         expect.objectContaining({ idFlow, name, idUnit, sequences })
  //       )
  //     )
  //   );

  //   const flowStageResponse = await supertest(app).get("/flowStages");
  //   expect(flowStageResponse.status).toBe(200);
  //   expect(
  //     flowStageResponse.body.map(({ idStageA, commentary, idStageB }) => ({
  //       idStageA,
  //       commentary,
  //       idStageB,
  //     }))
  //   ).toEqual(
  //     expectedTestFlows
  //       .flatMap(({ sequences }) => sequences)
  //       .map(({ from: idStageA, commentary, to: idStageB }) =>
  //         expect.objectContaining({ idStageA, commentary, idStageB })
  //       )
  //   );

  //   const record = 1;
  //   const expectedFlowsByRecord = {
  //     error: "Não há fluxos com esse processo",
  //     message: `Não há fluxos com o processo '${record}'`,
  //   };
  //   const flowsByRecordResponse = await supertest(app).get(
  //     `/flows/process/${record}`
  //   );
  //   expect(flowsByRecordResponse.status).toBe(404);
  //   expect(flowsByRecordResponse.body).toEqual(expectedFlowsByRecord);
  // });

  // test("Create flow and delete a stage", async () => {
  //   const testStages = [
  //     { name: "st0", duration: 1, idUnit: 1 },
  //     { name: "st1", duration: 2, idUnit: 1 },
  //     { name: "st2", duration: 3, idUnit: 1 },
  //     { name: "st3", duration: 4, idUnit: 1 },
  //   ];

  //   for (const testStage of testStages) {
  //     const newStageResponse = await supertest(app)
  //       .post("/newStage")
  //       .send(testStage);
  //     expect(newStageResponse.status).toBe(200);
  //   }

  //   const testFlows = [
  //     {
  //       name: "flow0",
  //       idUnit: 1,
  //       sequences: [
  //         { from: 1, to: 2, commentary: null },
  //         { from: 2, to: 3, commentary: null },
  //         { from: 3, to: 4, commentary: null },
  //       ],
  //       idUsersToNotify: ["12345678901"],
  //     },
  //   ];

  //   const expectedTestFlows = testFlows.map((testFlow, index) => {
  //     let stages = [];
  //     for (const { from, to } of testFlow.sequences) {
  //       if (!stages.includes(from)) {
  //         stages.push(from);
  //       }
  //       if (!stages.push(to)) {
  //         stages.push(to);
  //       }
  //     }
  //     return {
  //       idFlow: index + 1,
  //       name: testFlow.name,
  //       idUnit: testFlow.idUnit,
  //       sequences: testFlow.sequences,
  //       stages,
  //     };
  //   });

  //   for (const testFlow of testFlows) {
  //     const newFlowResponse = await supertest(app)
  //       .post("/newFlow")
  //       .send(testFlow);
  //     expect(newFlowResponse.status).toBe(200);
  //   }
  //   /*
  //   const flowsResponse = await supertest(app).get("/flows");
  //   expect(flowsResponse.status).toBe(200);
  //   expect(flowsResponse.body).toEqual(
  //     expect.arrayContaining(
  //       expectedTestFlows.map((expectedTestFlow) =>
  //         expect.objectContaining(expectedTestFlow)
  //       )
  //     )
  //   ); */

  //   const deletedStage = { from: 2, to: 3, commentary: null };

  //   const testFlowsDeletedStage = [
  //     {
  //       name: "flow0",
  //       idUnit: 1,
  //       sequences: [
  //         { from: 1, to: 2, commentary: null },
  //         { from: 3, to: 4, commentary: null },
  //       ],
  //       idUsersToNotify: ["12345678901"],
  //     },
  //   ];

  //   const expectedTestFlowsDeletedStage = testFlowsDeletedStage.map(
  //     (testFlow, index) => {
  //       let stages = [];
  //       for (const { from, to } of testFlow.sequences) {
  //         if (!stages.includes(from)) {
  //           stages.push(from);
  //         }
  //         if (!stages.push(to)) {
  //           stages.push(to);
  //         }
  //       }
  //       return {
  //         idFlow: index + 1,
  //         name: testFlow.name,
  //         idUnit: testFlow.idUnit,
  //         sequences: testFlow.sequences,
  //         stages,
  //       };
  //     }
  //   );

  //   const deleteStageResponse = await supertest(app).delete(
  //     `/flow/1/${deletedStage.from}/${deletedStage.to}`
  //   );
  //   expect(deleteStageResponse.status).toBe(200);
  //   expect(deleteStageResponse.body).toEqual({
  //     message: `Desassociação entre fluxo '1' e etapas '${deletedStage.from}' e '${deletedStage.to}' concluída`,
  //   });
  // });

  // test("Try deleting an inexistent flow", async () => {
  //   const deleteFlowResponse = await supertest(app).delete("/flow/1");
  //   expect(deleteFlowResponse.status).toBe(404);
  //   expect(deleteFlowResponse.body).toEqual({
  //     message: "Fluxo não encontrado",
  //   });
  // });

  // test("Delete flows", async () => {
  //   const testStages = [
  //     { name: "st0", duration: 1, idUnit: 1 },
  //     { name: "st1", duration: 2, idUnit: 1 },
  //     { name: "st2", duration: 3, idUnit: 1 },
  //     { name: "st3", duration: 4, idUnit: 1 },
  //   ];

  //   for (const testStage of testStages) {
  //     const newStageResponse = await supertest(app)
  //       .post("/newStage")
  //       .send(testStage);
  //     expect(newStageResponse.status).toBe(200);
  //   }

  //   const testFlows = [
  //     {
  //       name: "flow0",
  //       idUnit: 1,
  //       sequences: [
  //         { from: 1, to: 2, commentary: null },
  //         { from: 2, to: 3, commentary: null },
  //         { from: 3, to: 4, commentary: null },
  //       ],
  //       idUsersToNotify: ["12345678901"],
  //     },
  //   ];

  //   for (const testFlow of testFlows) {
  //     const newFlowResponse = await supertest(app)
  //       .post("/newFlow")
  //       .send(testFlow);
  //     expect(newFlowResponse.status).toBe(200);
  //   }

  //   const deletedResponse = await supertest(app).delete("/flow/1");
  //   expect(deletedResponse.status).toBe(200);
  //   expect(deletedResponse.body).toEqual({
  //     message: "Fluxo apagado com sucesso",
  //   });
  //   /*
  //   const flowsResponse = await supertest(app).get("/flows");
  //   expect(flowsResponse.status).toBe(200);
  //   expect(flowsResponse.body).toEqual([]);*/

  //   const flowResponse = await supertest(app).get("/flow/1");
  //   expect(flowResponse.status).toBe(404);
  //   expect(flowResponse.body).toEqual({ message: "Não há fluxo '1'" });
  // });

  // test("Try updating a flow", async () => {
  //   const testStages = [
  //     { name: "st0", duration: 1, idUnit: 1 },
  //     { name: "st1", duration: 2, idUnit: 1 },
  //     { name: "st2", duration: 3, idUnit: 1 },
  //     { name: "st3", duration: 4, idUnit: 1 },
  //     { name: "st4", duration: 5, idUnit: 1 },
  //   ];

  //   for (const testStage of testStages) {
  //     const newStageResponse = await supertest(app)
  //       .post("/newStage")
  //       .send(testStage);
  //     expect(newStageResponse.status).toBe(200);
  //   }

  //   const testFlows = [
  //     {
  //       name: "flow0",
  //       idUnit: 1,
  //       sequences: [
  //         { from: 1, to: 2, commentary: null },
  //         { from: 2, to: 3, commentary: null },
  //         { from: 3, to: 4, commentary: null },
  //         { from: 4, to: 5, commentary: null },
  //       ],
  //       idUsersToNotify: ["12345678901"],
  //     },
  //   ];

  //   for (const testFlow of testFlows) {
  //     const newFlowResponse = await supertest(app)
  //       .post("/newFlow")
  //       .send(testFlow);
  //     expect(newFlowResponse.status).toBe(200);
  //   }

  //   const updatedName = "fluxo_0";

  //   const updatedTestFlows = [
  //     {
  //       idFlow: 1,
  //       name: updatedName,
  //       idUnit: 1,
  //       sequences: [
  //         { from: 1, to: 2, commentary: "12" },
  //         { from: 2, to: 3, commentary: "23" },
  //         { from: 3, to: 4, commentary: "34" },
  //         { from: 4, to: 5, commentary: "45" },
  //       ],
  //       idUsersToNotify: ["12345678901"],
  //     },
  //   ];

  //   const expectedTestFlows = updatedTestFlows.map((testFlow, index) => {
  //     let stages = [];
  //     for (const { from, to } of testFlow.sequences) {
  //       if (!stages.includes(from)) {
  //         stages.push(from);
  //       }
  //       if (!stages.push(to)) {
  //         stages.push(to);
  //       }
  //     }
  //     return {
  //       idFlow: index + 1,
  //       name: testFlow.name,
  //       idUnit: testFlow.idUnit,
  //       sequences: testFlow.sequences,
  //       stages,
  //     };
  //   });

  //   for (const flow of updatedTestFlows) {
  //     const updateResponse = await supertest(app).put("/flow").send(flow);
  //     expect(updateResponse.status).toBe(200);
  //   }

  //   /* const flowsResponse = await supertest(app).get("/flows");
  //   expect(flowsResponse.status).toBe(200);
  //   expect(flowsResponse.body).toEqual(
  //     expect.arrayContaining(
  //       expectedTestFlows.map((expectedTestFlow) =>
  //         expect.objectContaining(expectedTestFlow)
  //       )
  //     )
  //   ); */
  // });
});
