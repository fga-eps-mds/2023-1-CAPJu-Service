import { Database } from "../TestDatabase.js";
import "sequelize";
import supertest from "supertest";
import { app, injectDB } from "../TestApp";
import Flow from "../../models/Flow.js";
import jwt from "jsonwebtoken";
import { tokenToUser } from "../../middleware/authMiddleware.js";

describe("flow endpoints", () => {
  beforeEach(async () => {
    const database = new Database();
    await database.migrate();
    await database.seed();
    const stages = [
      {
        name: "Nova etapa A",
        duration: 10,
        idUnit: 1,
      },
      {
        name: "Nova etapa B",
        duration: 10,
        idUnit: 1,
      },
      {
        name: "Nova etapa C",
        duration: 10,
        idUnit: 1,
      },
    ];

    let allStages = [];
    for (const stage of stages) {
      const testStageResponse = await supertest(app)
        .post("/newStage")
        .send(stage);
      expect(testStageResponse.status).toBe(200);
      allStages.push(testStageResponse.body);
    }

    const flows = [
      {
        name: "Fluxo ABC",
        idUnit: 1,
        sequences: [
          { from: 1, to: 2, commentary: "Primeiro" },
          { from: 2, to: 3, commentary: "Segundo" },
        ],
        idUsersToNotify: ["12345678901", "12345678909"],
      },
      {
        name: "Fluxo ABCD",
        idUnit: 1,
        sequences: [{ from: 1, to: 2, commentary: "Primeiro" }],
        idUsersToNotify: ["12345678901", "12345678909"],
      },
    ];

    let allFlows = [];
    for (const flow of flows) {
      const createdFlow = await supertest(app).post("/newFlow").send(flow);
      expect(createdFlow.status).toBe(200);
      allFlows.push(createdFlow.body);
    }
    injectDB(database);
  });

  test("new flow", async () => {
    const flow = {
      name: "Fluxo ABC",
      idUnit: 1,
      sequences: [
        { from: 1, to: 2, commentary: "Primeiro" },
        { from: 2, to: 3, commentary: "Segundo" },
      ],
      idUsersToNotify: ["12345678901", "12345678909"],
    };

    const createdFlow = await supertest(app).post("/newFlow").send(flow);

    expect(createdFlow.status).toBe(200);
    const currentFlow = await supertest(app).get(
      `/flow/${createdFlow.body.idFlow}`
    );
    expect(currentFlow.status).toBe(200);
    expect(currentFlow.body.idFlow).toEqual(createdFlow.body.idFlow);
    expect(currentFlow.body.name).toEqual(createdFlow.body.name);
    expect(currentFlow.body.idUnit).toEqual(createdFlow.body.idUnit);
    expect(currentFlow.body.sequences).toEqual(createdFlow.body.sequences);
  });

  test("get flow by id", async () => {
    const idFlow = 1;
    const flowResponse = await supertest(app).get(`/flow/${idFlow}`);
    expect(flowResponse.status).toBe(200);
    expect(flowResponse.body.idFlow).toBe(idFlow);
  });

  test("get all flows", async () => {
    const flowsResponse = await supertest(app).get("/flows").set("test", `ok`);

    expect(flowsResponse.status).toBe(200);
    flowsResponse.body.flows.forEach((flow) => {
      expect(flow).toHaveProperty("idFlow");
      expect(flow).toHaveProperty("name");
      expect(flow).toHaveProperty("idUnit");
      expect(flow).toHaveProperty("sequences");
      expect(flow).toHaveProperty("stages");
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
    const idFlow = 1;
    const usersToNotifyResponse = await supertest(app).get(
      `/flow/${idFlow}/usersToNotify`
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

  test("update flow", async () => {
    const idFlow = 1;
    const newFlowData = {
      name: "Fluxo ABC Editado",
      idFlow: idFlow,
      sequences: [
        { from: 1, to: 2, commentary: "Primeiro Comentário Editado" },
        { from: 2, to: 3, commentary: "Segundo Comentário Editado" },
      ],
      idUsersToNotify: ["12345678901", "12345678909"],
    };

    const updatedFlowResponse = await supertest(app)
      .put(`/flow`)
      .send(newFlowData);

    expect(updatedFlowResponse.status).toBe(200);
    expect(updatedFlowResponse.body).toHaveProperty("idFlow");
    expect(updatedFlowResponse.body).toHaveProperty("name");
    expect(updatedFlowResponse.body).toHaveProperty("idUnit");
    expect(updatedFlowResponse.body).toHaveProperty("sequences");
    expect(updatedFlowResponse.body).toHaveProperty("usersToNotify");

    expect(updatedFlowResponse.body.idFlow).toEqual(newFlowData.idFlow);
    expect(updatedFlowResponse.body.name).toEqual(newFlowData.name);
    expect(updatedFlowResponse.body.sequences).toEqual(newFlowData.sequences);
    expect(updatedFlowResponse.body.usersToNotify).toEqual(
      newFlowData.idUsersToNotify
    );
  });

  test("delete flow", async () => {
    const idFlow = 1;
    const deletedFlow = await supertest(app).delete(`/flow/${idFlow}`);
    expect(deletedFlow.status).toBe(200);
    expect(deletedFlow.body.message).toEqual("Fluxo apagado com sucesso");
  });

  test("delete flow stage", async () => {
    const idFlow = 1;
    const flowResponse = await supertest(app).get(`/flowSequences/${idFlow}`);
    expect(flowResponse.status).toBe(200);

    const deletedFlowStage = await supertest(app).delete(
      `/flow/${flowResponse.body.idFlow}/${flowResponse.body.sequences[0].from}/${flowResponse.body.sequences[0].to}`
    );
    expect(deletedFlowStage.status).toBe(200);
    expect(deletedFlowStage.body.message).toEqual(
      `Desassociação entre fluxo '${flowResponse.body.idFlow}' e etapas '${flowResponse.body.sequences[0].from}' e '${flowResponse.body.sequences[0].to}' concluída`
    );
  });

  test("should return a 404 status with an error message if there are less than two sequences", async () => {
    const flowData = {
      name: "Fluxo Teste",
      idUnit: 1,
      sequences: [],
      idUsersToNotify: ["12345678901", "12345678909"],
    };

    const response = await supertest(app).post("/newFlow").send(flowData);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Necessário pelo menos duas etapas!");
    expect(response.body.json).toBeUndefined();
  });

  test("user not exists in unit", async () => {
    const flowData = {
      name: "Fluxo Teste",
      idUnit: 2,
      sequences: [
        { from: 1, to: 2, commentary: "Primeiro" },
        { from: 2, to: 3, commentary: "Segundo" },
      ],
      idUsersToNotify: ["12345678901", "12345678909"],
    };
    const response = await supertest(app).post("/newFlow").send(flowData);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      `Usuário '12345678901' não existe na unidade '2'`
    );
  });

  test("there is no relationship between streams", async () => {
    const flowData = {
      idFlow: 1,
      idStageA: 1,
      idStageB: 1,
    };
    const response = await supertest(app).delete(
      `/flow/${flowData.idFlow}/${flowData.idStageA}/${flowData.idStageB}`
    );
    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      `Não há relacionameto entre o fluxo '${flowData.idFlow}' e as etapas '${flowData.idStageA}' e '${flowData.idStageB}'`
    );
  });

  test("flow not found ", async () => {
    const idFlow = 10;
    const deletedFlow = await supertest(app).delete(`/flow/${idFlow}`);
    expect(deletedFlow.status).toBe(404);
    expect(deletedFlow.body.message).toEqual("Fluxo não encontrado");
  });
});
