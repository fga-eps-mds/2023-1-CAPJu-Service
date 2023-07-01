import { Database } from "../TestDatabase.js";
import "sequelize";
import supertest from "supertest";
import Process from "../../models/Process.js";
import { app, injectDB } from "../TestApp";
import { tokenToUser } from "../../middleware/authMiddleware.js";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";

describe("process endpoints", () => {
  beforeEach(async () => {
    const database = new Database();
    await database.migrate();
    await database.seed();
    injectDB(database);
  });

  test("new process", async () => {
    const testProcess = {
      record: "12345678901234567890",
      idUnit: 1,
      priority: 0,
      idFlow: 1,
      nickname: "Meu Primeiro Processo",
    };

    const newProcessResponse = await supertest(app)
      .post("/newProcess")
      .send(testProcess);

    expect(newProcessResponse.status).toBe(200);
  });

  test("Error in create new process", async () => {
    const testProcess = {
      record: "12345678901234567890",
      idUnit: 1,
      priority: 0,
      idFlow: 2,
      nickname: "Meu Primeiro Processo",
    };

    const newProcessResponse = await supertest(app)
      .post("/newProcess")
      .send(testProcess);

    expect(newProcessResponse.status).toBe(404);
  });

  test("new process and search", async () => {
    let processMock = [
      {
        record: "12345678901234567891",
        idUnit: 1,
        priority: 0,
        idFlow: 1,
        nickname: "Meu Primeiro Processo",
      },
      {
        record: "12345678901234567892",
        idUnit: 1,
        priority: 0,
        idFlow: 1,
        nickname: "Meu Segundo Processo",
      },
    ];

    const allProcesses = [];
    for (const process of processMock) {
      const newProcessResponse = await supertest(app)
        .post("/newProcess")
        .send(process);
      expect(newProcessResponse.status).toBe(200);
      expect(newProcessResponse.body.message).toEqual("Criado com sucesso!");
      allProcesses.push(newProcessResponse.body);
    }
    let processes = await Process.findAll();
    for (let index = 0; index < processes.length; index++) {
      expect(processes[index]?.dataValues?.record).toEqual(
        processMock[index]?.record
      );
    }
  });

  test("new process and delete it", async () => {
    let processMock = {
      record: "12345678901234567891",
      idUnit: 1,
      priority: 0,
      idFlow: 1,
      nickname: "Meu Primeiro Processo",
    };

    const newProcessResponse = await supertest(app)
      .post("/newProcess")
      .send(processMock);

    expect(newProcessResponse.status).toBe(200);

    const responseDelete = await supertest(app).delete(
      `/deleteProcess/${newProcessResponse.body.flowProcess.record}`
    );

    expect(responseDelete.body.message).toEqual("OK");
    expect(responseDelete.status).toBe(200);
  });

  test("new sprocess and check by id", async () => {
    let processMock = {
      record: "12345678901234567891",
      idUnit: 1,
      priority: 0,
      idFlow: 1,
      nickname: "Meu Primeiro Processo",
    };

    const newProcessResponse = await supertest(app)
      .post("/newProcess")
      .send(processMock);

    expect(newProcessResponse.status).toBe(200);

    let process = await Process.findOne({
      where: {
        record: newProcessResponse.body.flowProcess.record,
      },
    });

    const response = await supertest(app).get(
      `/getOneProcess/${process.record}`
    );
    expect(response.status).toBe(200);
    expect(response.body.record).toEqual(processMock.record);
  });

  test("get priorities ", async () => {
    const prioritiesResponse = await supertest(app).get("/priorities");

    expect(prioritiesResponse.status).toBe(200);
    expect(prioritiesResponse.body).toHaveLength(8);
    prioritiesResponse.body.forEach((priority) => {
      expect(priority).toHaveProperty("idPriority");
      expect(priority).toHaveProperty("description");
      expect(priority).toHaveProperty("createdAt");
      expect(priority).toHaveProperty("updatedAt");
    });
  });

  test("get process with priority ", async () => {
    let processMock = [
      {
        record: "12345678901234567891",
        idUnit: 1,
        priority: 0,
        idFlow: 1,
        nickname: "Meu Primeiro Processo",
      },
      {
        record: "12345678901234567892",
        idUnit: 1,
        priority: 1,
        idFlow: 1,
        nickname: "Meu Segundo Processo",
      },
    ];

    const allProcesses = [];
    for (const process of processMock) {
      const newProcessResponse = await supertest(app)
        .post("/newProcess")
        .send(process);
      expect(newProcessResponse.status).toBe(200);
      expect(newProcessResponse.body.message).toEqual("Criado com sucesso!");
      allProcesses.push(newProcessResponse.body);
    }

    const priorities = [1, 2, 3, 4, 5, 6, 7, 8];

    const priorityProcesses = await Process.findAll({
      where: {
        idPriority: priorities,
      },
    });

    priorityProcesses.forEach((process) => {
      expect(process).toHaveProperty("record");
      expect(process).toHaveProperty("nickname");
      expect(process).toHaveProperty("effectiveDate");
      expect(process).toHaveProperty("idUnit");
      expect(process).toHaveProperty("idStage");
      expect(process).toHaveProperty("idPriority");
      expect(process).toHaveProperty("createdAt");
      expect(process).toHaveProperty("updatedAt");
      expect(priorities).toContain(process.idPriority);
    });
  });

  // test("get process with priority ", async () => {
  //   const idFlow = 1;

  //   const testProcess = {
  //     record: "12345678901234567890",
  //     idUnit: 1,
  //     priority: 0,
  //     idFlow: 1,
  //     nickname: "Meu Primeiro Processo",
  //   };

  //   const newProcessResponse = await supertest(app)
  //     .post("/newProcess")
  //     .send(testProcess);

  //   expect(newProcessResponse.status).toBe(200);
  //   const processInFlow = await supertest(app).get(`/processes/${idFlow}`);
  //   expect(processInFlow.status).toBe(200);
  //   processInFlow.body.forEach((process) => {
  //     expect(process).toHaveProperty("idFlowProcess");
  //     expect(process).toHaveProperty("idFlow");
  //     expect(process).toHaveProperty("record");
  //     expect(process).toHaveProperty("finalised");
  //     expect(process).toHaveProperty("createdAt");
  //     expect(process).toHaveProperty("updatedAt");
  //     expect(process).toHaveProperty("createdAt");
  //     expect(process).toHaveProperty("effectiveDate");
  //     expect(process).toHaveProperty("idUnit");
  //     expect(process).toHaveProperty("idStage");
  //     expect(process).toHaveProperty("idPriority");
  //     expect(process).toHaveProperty("status");
  //     expect(process).toHaveProperty("progress");
  //     expect(process.idFlow).toEqual(idFlow);
  //   });
  // });

  test("update process", async () => {
    const testProcess = {
      record: "12345678901234567890",
      idUnit: 1,
      priority: 0,
      idFlow: 1,
      nickname: "Meu Primeiro Processo",
    };

    const newProcessResponse = await supertest(app)
      .post("/newProcess")
      .send(testProcess);

    expect(newProcessResponse.status).toBe(200);

    const processData = {
      idFlow: 1,
      nickname: "Novo nome do meu processo",
      priority: 3,
      status: "inProgress",
      idStage: 1,
      record: "12345678901234567890",
    };

    const updatedProcess = await supertest(app)
      .put(`/updateProcess`)
      .send(processData);
    expect(updatedProcess.status).toBe(200);
    expect(updatedProcess.body.process.record).toEqual(testProcess.record);
    expect(updatedProcess.body.process.nickname).toEqual(processData.nickname);
    expect(updatedProcess.body.process.idPriority).toEqual(
      processData.priority
    );
    expect(updatedProcess.body.process.status).toEqual(processData.status);
    expect(updatedProcess.body.process.idStage).toEqual(processData.idStage);
  });

  test("update process stage", async () => {
    const testProcess = {
      record: "12345678901234567890",
      idUnit: 1,
      priority: 0,
      idFlow: 1,
      nickname: "Meu Primeiro Processo",
    };

    const newProcessResponse = await supertest(app)
      .post("/newProcess")
      .send(testProcess);

    expect(newProcessResponse.status).toBe(200);

    const processData = {
      idFlow: 1,
      nickname: "Novo nome do meu processo",
      priority: 3,
      status: "inProgress",
      idStage: 1,
      record: "12345678901234567890",
    };

    const updatedProcess = await supertest(app)
      .put(`/updateProcess`)
      .send(processData);
    expect(updatedProcess.status).toBe(200);
    expect(updatedProcess.body.process.record).toEqual(testProcess.record);
    expect(updatedProcess.body.process.nickname).toEqual(processData.nickname);
    expect(updatedProcess.body.process.idPriority).toEqual(
      processData.priority
    );
    expect(updatedProcess.body.process.status).toEqual(processData.status);
    expect(updatedProcess.body.process.idStage).toEqual(processData.idStage);

    const processStageData = {
      idFlow: 1,
      record: "12345678901234567890",
      from: 1,
      to: 2,
    };

    const updatedProcessStage = await supertest(app)
      .put(`/processUpdateStage`)
      .send(processStageData);

    expect(updatedProcessStage.body.message).toEqual(
      "Etapa atualizada com sucesso"
    );
    expect(updatedProcessStage.status).toBe(200);
  });

  test("test", async () => {
    const testUser = {
      cpf: "12345678901",
      password: "123Teste",
    };
    const login = await supertest(app)
      .post("/login")
      .send(testUser, tokenToUser);
    const req = {
      headers: { authorization: `Bearer ${login.body.token}` },
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
        req.user = await User.findByPk(decoded.id);
        if (req.user.accepted === false) {
          throw new Error();
        }
      } catch (error) {
        console.log(error);
      }
    }

    const testProcess = {
      record: "12345678901234567890",
      idUnit: 1,
      priority: 0,
      idFlow: 1,
      nickname: "Meu Primeiro Processo",
    };

    const newProcessResponse = await supertest(app)
      .post("/newProcess")
      .send(testProcess);

    expect(newProcessResponse.status).toBe(200);

    const processesResponse = await supertest(app)
      .get("/processes")
      .set("test", `ok`);
    const result = await req.headers.test;
    expect(result).not.toEqual("ok");
    expect(processesResponse.status).toBe(200);
    expect(processesResponse.body.processes.length).toBe(1);
  });
});
