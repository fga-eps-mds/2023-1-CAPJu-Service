import { Database } from "../TestDatabase.js";
import "sequelize";
import supertest from "supertest";
import { app, injectDB } from "../TestApp";
import Flow from "../../models/Flow.js";
import jwt from "jsonwebtoken";
import { tokenToUser } from "../../middleware/authMiddleware.js";
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

  test("create and update flow", async () => {
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
    const newFlowData = {
      name: "Fluxo AB Editado",
      idFlow: newFlowResponse.body.idFlow,
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

  test("test", async () => {
    const testUser = {
      "cpf": "12345678901",
      "password": "123Teste",
    };
    const login = await supertest(app).post("/login").send(testUser,tokenToUser);
    const req = {
      headers: {authorization: `Bearer ${login.body.token}`}
    };
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        // Get token from header
        const token = req.headers.authorization.split(" ")[1];
  
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
        // Get user from the token
        req.user = await Flow.findByPk(decoded.id);
        if (req.user.accepted === false) {
          throw new Error();
        }
      } catch (error) {
        console.log(error);
      }
    }

    const flowsResponse = await supertest(app).get("/flows").set("test", `ok`);
    expect(flowsResponse.status).toBe(200);
    expect(flowsResponse.body.flows.length).toBe(1);
  });
});
