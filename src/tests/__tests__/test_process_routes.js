import ProcessController from "../../controllers/ProcessController.js";
import Process from "../../models/Process.js";
import Priority from "../../models/Priority.js";
import FlowProcess from "../../models/FlowProcess.js";
import FlowStage from "../../models/FlowStage.js";
import Flow from "../../models/Flow.js";
import Stage from "../../models/Stage.js";
import Database from "../../database/index.js";

import * as middleware from "../../middleware/authMiddleware.js";
import { Error } from "sequelize";

jest.mock("axios");

const reqMock = {};
const resMock = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

describe("process endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("index - there are no processes (204)", async () => {
    jest.spyOn(middleware, "tokenToUser").mockReturnValue({
      idUnit: 1,
      idRole: 5,
    });
    Process.findAll = jest.fn().mockReturnValue([]);

    reqMock.query = {
      limit: 10,
      offset: 0,
      filter: 0,
    };
    await ProcessController.index(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith([]);
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("index - returning processesWithFlows (200))", async () => {
    const processes = [
      {
        idFlow: 10,
        nickname: "Meu Primeiro Processo",
        idPriority: 0,
        status: "inProgress",
        idStage: 1,
        record: "12345678901234567890",
        idUnit: 1,
        effectiveDate: new Date(),
        progress: [],
      },
    ];
    const flowProcesses = [
      {
        idFlowProcess: 1,
        idFlow: 10,
        record: "12345678901234567890",
        finalised: false,
      },
    ];

    jest.spyOn(middleware, "tokenToUser").mockReturnValue({
      idUnit: 1,
      idRole: 5,
    });
    Process.findAll = jest.fn().mockReturnValue(processes);
    FlowProcess.findAll = jest.fn().mockReturnValue(flowProcesses);
    Process.count = jest.fn().mockReturnValue(1);

    reqMock.query = {
      limit: 10,
      offset: 0,
      filter: 0,
    };
    await ProcessController.index(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("index - internal server error (500))", async () => {
    const error = new Error("Internal Server Error");
    jest.spyOn(middleware, "tokenToUser").mockReturnValue({
      idUnit: 1,
      idRole: 5,
    });
    Process.findAll = jest.fn().mockRejectedValue(error);

    reqMock.query = {
      limit: 10,
      offset: 0,
      filter: 0,
    };
    await ProcessController.index(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith({
      error,
      message: "Erro ao buscar processos",
    });
  });

  test("getPriorities - there are no priorities (204))", async () => {
    Priority.findAll = jest.fn().mockReturnValue(false);

    await ProcessController.getPriorities(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith([]);
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("getPriorities - returning all priorities (200))", async () => {
    Priority.findAll = jest.fn().mockReturnValue([]);

    await ProcessController.getPriorities(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith([]);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("getPriorities - internal server error (500))", async () => {
    const error = new Error("Internal Server Error");
    Priority.findAll = jest.fn().mockRejectedValue(error);

    await ProcessController.getPriorities(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith(error);
  });

  test("getPriorityProcess - there are no priorities processes (204))", async () => {
    Process.findAll = jest.fn().mockReturnValue(false);

    await ProcessController.getPriorityProcess(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(204);
    expect(resMock.json).toHaveBeenCalledWith([]);
  });

  test("getPriorityProcess - returning priorities processes (200))", async () => {
    Process.findAll = jest.fn().mockReturnValue([]);

    await ProcessController.getPriorityProcess(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith([]);
  });

  test("getById - process does not exist (204))", async () => {
    Process.findByPk = jest.fn().mockReturnValue(false);

    reqMock.params = { id: 1 };
    await ProcessController.getById(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({});
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("getById - returning process (200))", async () => {
    Process.findByPk = jest.fn().mockReturnValue([]);

    reqMock.params = { id: 1 };
    await ProcessController.getById(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith([]);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("getById - internal server error (500))", async () => {
    const error = new Error("Internal Server Error");
    const idProcess = 1;
    Process.findByPk = jest.fn().mockRejectedValue(error);

    reqMock.params = { id: idProcess };
    await ProcessController.getById(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith({
      error,
      message: `Erro ao procurar processo ${idProcess}`,
    });
  });

  test("store - record needs to be CNJ (400))", async () => {
    const process = {
      idFlow: 10,
      nickname: "Meu Primeiro Processo",
      priority: 0,
      record: "123",
    };

    reqMock.body = process;
    await ProcessController.store(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.json).toHaveBeenCalledWith({
      error: "Registro fora do padrão CNJ",
      message: `Registro '${process.record}' está fora do padrão CNJ`,
    });
  });

  test("store - create process (200))", async () => {
    const process = {
      idFlow: 10,
      nickname: "Meu Primeiro Processo",
      priority: 0,
      record: "12345678901234567890",
    };
    const flow = {
      idFlow: 10,
      name: "Fluxo AB",
      idUnit: 1,
      sequences: [
        { from: 1, to: 2, commentary: "Primeiro Comentário" },
        { from: 2, to: 3, commentary: "Segundo Comentário" },
      ],
      idUsersToNotify: ["12345678901", "12345678909"],
    };

    reqMock.body = process;
    Flow.findByPk = jest.fn().mockReturnValue(flow);
    Process.create = jest.fn().mockResolvedValue();
    FlowProcess.create = jest.fn().mockResolvedValue({});

    await ProcessController.store(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({});
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("store - failed to create process (500))", async () => {
    const process = {
      idFlow: 10,
      nickname: "Meu Primeiro Processo",
      priority: 0,
      record: "12345678901234567890",
    };

    reqMock.body = process;
    Flow.findByPk = jest.fn().mockReturnValue(false);

    await ProcessController.store(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("store - internal server error (500))", async () => {
    const process = {
      idFlow: 10,
      nickname: "Meu Primeiro Processo",
      priority: 0,
      record: "12345678901234567890",
    };

    reqMock.body = process;
    const error = new Error("Internal Server Error");
    Flow.findByPk = jest.fn().mockRejectedValue(error);

    await ProcessController.store(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith(error);
  });

  test("processesInFlows - list processes (200))", async () => {
    const processes = [
      { id: 1, name: "Process 1" },
      { id: 2, name: "Process 2" },
    ];

    Database.connection = {
      query: jest.fn().mockResolvedValueOnce(processes),
    };
    Database.connection.query.mockResolvedValueOnce([{ total: 2 }]);

    reqMock.params = { idFlow: 1 };
    await ProcessController.processesInFlow(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      processes: processes,
      totalPages: 1,
    });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("processesInFlows - internal server error (500))", async () => {
    reqMock.params = { idFlow: 1 };
    const error = new Error("Internal Server Error");
    Database.connection = {
      query: jest.fn().mockRejectedValue(error),
    };

    await ProcessController.processesInFlow(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith(error);
  });

  test("updateProcess - record needs to be CNJ (400))", async () => {
    const process = {
      idFlow: 10,
      nickname: "Meu Primeiro Processo",
      priority: 0,
      status: "inProgress",
      idStage: 1,
      record: "123",
    };

    reqMock.body = process;
    await ProcessController.updateProcess(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error: "Registro fora do padrão CNJ",
      message: `Registro '${process.record}' está fora do padrão CNJ`,
    });
    expect(resMock.status).toHaveBeenCalledWith(400);
  });

  test("updateProcess - there are no stages (404))", async () => {
    Process.findByPk = jest.fn().mockResolvedValue([]);
    FlowStage.findAll = jest.fn().mockResolvedValue([]);

    reqMock.body = {
      idFlow: 10,
      nickname: "Meu Primeiro Processo",
      priority: 0,
      status: "inProgress",
      idStage: 1,
      record: "12345678901234567890",
    };
    await ProcessController.updateProcess(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      message: "Não há etapas neste fluxo",
    });
    expect(resMock.status).toHaveBeenCalledWith(404);
  });

  test("updateProcess - there are no processes (404))", async () => {
    Process.findByPk = jest.fn().mockResolvedValue(false);
    FlowStage.findAll = jest.fn().mockResolvedValue([{}]);

    reqMock.body = {
      idFlow: 10,
      nickname: "Meu Primeiro Processo",
      priority: 0,
      status: "inProgress",
      idStage: 1,
      record: "12345678901234567890",
    };
    await ProcessController.updateProcess(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      message: "processo inexistente",
    });
    expect(resMock.status).toHaveBeenCalledWith(404);
  });

  test("updateProcess - return process and flowProcesses (200))", async () => {
    const process = {
      idFlow: 10,
      nickname: "Meu Primeiro Processo",
      idPriority: 0,
      status: "inProgress",
      idStage: 1,
      record: "12345678901234567890",
      idUnit: 1,
      effectiveDate: new Date(),
      progress: [],
      set: jest.fn(),
      save: jest.fn(),
    };
    const flowStage = {
      idFlowStage: 1,
      idStageA: 1,
      idStageB: 2,
      idFlow: 10,
      commentary: "",
    };
    const stage = {
      idStage: 1,
      name: "Stage A",
      idUnit: 1,
      duration: 1,
    };
    const flowProcess = {
      set: jest.fn(),
      save: jest.fn(),
    };

    Process.findByPk = jest.fn().mockResolvedValue(process);
    FlowStage.findAll = jest.fn().mockResolvedValue([flowStage]);
    Stage.findOne = jest.fn().mockResolvedValue(stage);
    FlowProcess.findAll = jest.fn().mockResolvedValue([flowProcess]);

    reqMock.body = process;
    await ProcessController.updateProcess(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("updateProcess - internal server error (500))", async () => {
    const process = {
      idFlow: 10,
      nickname: "Meu Primeiro Processo",
      priority: 0,
      status: "inProgress",
      idStage: 1,
      record: "12345678901234567890",
    };

    const error = new Error("Internal Server Error");

    Process.findByPk = jest.fn().mockRejectedValue(error);

    reqMock.body = process;
    await ProcessController.updateProcess(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("deleteProcess - process not found (404))", async () => {
    FlowProcess.destroy = jest.fn().mockResolvedValue({});
    Process.destroy = jest.fn().mockResolvedValue(0);

    reqMock.params = { record: "123" };
    await ProcessController.deleteProcess(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error: "Não há registro 123!",
    });
    expect(resMock.status).toHaveBeenCalledWith(404);
  });

  test("deleteProcess - process deleted (200))", async () => {
    FlowProcess.destroy = jest.fn().mockResolvedValue({});
    Process.destroy = jest.fn().mockResolvedValue(1);

    reqMock.params = { record: "123" };
    await ProcessController.deleteProcess(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({ message: "OK" });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("deleteProcess - internal server error (500))", async () => {
    const error = new Error("Internal Server Error");

    FlowProcess.destroy = jest.fn().mockRejectedValue(error);

    reqMock.params = { record: "123" };
    await ProcessController.deleteProcess(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("updateProcessStage - from, to or idFlow are invalid (400))", async () => {
    reqMock.body = {
      record: "12345678901234567890",
      from: NaN,
      to: NaN,
      idFlow: NaN,
      isNextStage: true,
    };
    await ProcessController.updateProcessStage(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error: "Identificadores inválidos",
      message: "Identificadores 'NaN', 'NaN' ou 'NaN' são inválidos",
    });
    expect(resMock.status).toHaveBeenCalledWith(400);
  });

  test("updateProcessStage - it is not possible to advance (409))", async () => {
    FlowStage.findAll = jest.fn().mockResolvedValue([]);

    reqMock.body = {
      record: "12345678901234567890",
      from: 1,
      to: 2,
      idFlow: 1,
      isNextStage: true,
    };
    await ProcessController.updateProcessStage(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error: "Transição impossível",
      message: "Não há a transição da etapa '2' para '1' no fluxo '1'",
    });
    expect(resMock.status).toHaveBeenCalledWith(409);
  });

  test("updateProcessStage - stage was updated (200))", async () => {
    FlowStage.findAll = jest.fn().mockResolvedValue([
      {
        idFlowStage: 1,
        idStageA: 1,
        idStageB: 2,
      },
    ]);
    Process.findOne = jest.fn().mockResolvedValue({
      idStage: 1,
      progress: [],
    });
    Stage.findOne = jest.fn().mockResolvedValue({
      duration: 1,
    });
    Process.update = jest.fn().mockResolvedValue([2]);

    reqMock.body = {
      record: "12345678901234567890",
      from: 1,
      to: 2,
      idFlow: 1,
      isNextStage: true,
    };
    await ProcessController.updateProcessStage(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      message: "Etapa atualizada com sucesso",
    });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("updateProcessStage - failed to update stage (409))", async () => {
    const record = "12345678901234567890";
    const to = 2;

    FlowStage.findAll = jest.fn().mockResolvedValue([
      {
        idFlowStage: 1,
        idStageA: 1,
        idStageB: 2,
      },
    ]);
    Process.findOne = jest.fn().mockResolvedValue({
      idStage: 1,
      progress: [],
    });
    Stage.findOne = jest.fn().mockResolvedValue({
      duration: 1,
    });
    Process.update = jest.fn().mockResolvedValue([0]);

    reqMock.body = {
      record: record,
      from: 1,
      to: to,
      idFlow: 1,
      isNextStage: true,
    };
    await ProcessController.updateProcessStage(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error: "Impossível atualizar etapa",
      message: `Impossível atualizar processo '${record}' para etapa '${to}`,
    });
    expect(resMock.status).toHaveBeenCalledWith(409);
  });

  test("updateProcessStage - internal server error (500))", async () => {
    const error = new Error("Internal Server Error");

    FlowStage.findAll = jest.fn().mockRejectedValue(error);

    reqMock.body = {
      record: "12345678901234567890",
      from: 1,
      to: 2,
      idFlow: 1,
      isNextStage: true,
    };
    await ProcessController.updateProcessStage(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });
});
