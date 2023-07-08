import FlowController from "../../controllers/FlowController.js";
import Flow from "../../models/Flow.js";
import User from "../../models/User.js";
import Stage from "../../models/Stage.js";
import FlowUser from "../../models/FlowUser.js";
import FlowStage from "../../models/FlowStage.js";
import FlowProcess from "../../models/FlowProcess.js";

import * as middleware from "../../middleware/authMiddleware.js";

jest.mock("axios");

let reqMock = {};
let resMock = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

describe("flow endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getById - list flowSequence (200)", async () => {
    const flowData = {
      name: "Fluxo AB",
      idUnit: 1,
      sequences: [
        { from: 1, to: 2, commentary: "Primeiro Comentário" },
        { from: 2, to: 3, commentary: "Segundo Comentário" },
      ],
      idUsersToNotify: ["12345678901", "12345678909"],
    };
    const idFlow = 1;

    Flow.findByPk = jest.fn().mockResolvedValue({
      idFlow,
      ...flowData,
    });
    FlowStage.findAll = jest.fn().mockResolvedValue([]);

    reqMock.params = idFlow;
    await FlowController.getById(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("getById - internal server error (500)", async () => {
    const error = new Error("Internal Server Error");
    Flow.findByPk = jest.fn().mockRejectedValue(error);

    reqMock.params = { idFlow: 1 };
    await FlowController.getById(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("getByIdWithSequence - list flow sequence (200)", async () => {
    const flowData = {
      name: "Fluxo AB",
      idUnit: 1,
      sequences: [
        { from: 1, to: 2, commentary: "Primeiro Comentário" },
        { from: 2, to: 3, commentary: "Segundo Comentário" },
      ],
      idUsersToNotify: ["12345678901", "12345678909"],
    };
    const idFlow = 1;

    Flow.findByPk = jest.fn().mockResolvedValue({
      idFlow,
      ...flowData,
    });
    FlowStage.findAll = jest.fn().mockResolvedValue([
      { idStageA: 1, idStageB: 2, commentary: "Primeiro Comentário" },
      { idStageA: 2, idStageB: 3, commentary: "Segundo Comentário" },
    ]);

    reqMock.params = idFlow;
    await FlowController.getByIdWithSequence(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("getById - internal server error (500)", async () => {
    const error = new Error("Internal Server Error");
    Flow.findByPk = jest.fn().mockRejectedValue(error);

    reqMock.params = { idFlow: 1 };
    await FlowController.getByIdWithSequence(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("getFlowStages - list flowStages (200)", async () => {
    FlowStage.findAll = jest.fn().mockResolvedValue([]);

    await FlowController.getFlowStages(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith([]);
  });

  test("getFlowStages - internal server error (500)", async () => {
    const error = new Error("Internal Server Error");
    FlowStage.findAll = jest.fn().mockRejectedValue(error);

    await FlowController.getFlowStages(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("getUsersToNotify - list users to notify (200)", async () => {
    const idFlow = 1;
    const usersToNotify = ["12345678901", "12345678909"];

    FlowUser.sequelize = {
      query: jest.fn().mockResolvedValue(usersToNotify),
    };

    reqMock.params = idFlow;
    await FlowController.getUsersToNotify(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({ usersToNotify: usersToNotify });
  });

  test("getUsersToNotify - internal server error (500)", async () => {
    const error = new Error("Internal Server Error");
    FlowUser.sequelize = {
      query: jest.fn().mockRejectedValue(error),
    };

    await FlowController.getUsersToNotify(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("store - add new flow (200)", async () => {
    const flowData = {
      name: "Fluxo AB",
      idUnit: 1,
      sequences: [
        { from: 1, to: 2, commentary: "Primeiro Comentário" },
        { from: 2, to: 3, commentary: "Segundo Comentário" },
      ],
      idUsersToNotify: ["12345678901", "12345678909"],
    };

    User.findOne = jest.fn().mockResolvedValue({});
    Stage.findByPk = jest.fn(1).mockResolvedValue({ idStage: 1 });
    Stage.findByPk = jest.fn(2).mockResolvedValue({ idStage: 2 });
    Flow.create = jest.fn().mockResolvedValue({
      idFlow: 1,
      ...flowData,
    });
    FlowStage.create = jest.fn().mockResolvedValue({});
    FlowUser.create = jest.fn().mockResolvedValue({});

    reqMock.body = flowData;
    await FlowController.store(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      idFlow: 1,
      name: flowData.name,
      idUnit: flowData.idUnit,
      sequences: flowData.sequences,
      usersToNotify: flowData.idUsersToNotify,
    });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("store - return an error message if there are less than two sequences (404)", async () => {
    const flowData = {
      name: "Fluxo Teste",
      idUnit: 1,
      sequences: [],
      idUsersToNotify: ["12345678901", "12345678909"],
    };

    User.findOne = jest.fn().mockResolvedValue({});

    reqMock.body = flowData;
    await FlowController.store(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(404);
    expect(resMock.json).toHaveBeenCalledWith({
      message: "Necessário pelo menos duas etapas!",
    });
  });

  test("store - internal server error (500)", async () => {
    const error = new Error("Internal Server Error");
    User.findOne = jest.fn().mockRejectedValue(error);

    await FlowController.store(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("update - change flow name (200)", async () => {
    const flowData = {
      idFlow: 1,
      name: "Fluxo AB",
      idUnit: 1,
      sequences: [
        { from: 1, to: 2, commentary: "Primeiro Comentário" },
        { from: 2, to: 3, commentary: "Segundo Comentário" },
      ],
      idUsersToNotify: ["12345678901", "12345678909"],
      set: jest.fn(),
      save: jest.fn(),
    };

    Flow.findByPk = jest.fn().mockResolvedValue(flowData);
    FlowStage.destroy = jest.fn().mockResolvedValue();
    FlowUser.destroy = jest.fn().mockResolvedValue();
    User.findOne = jest.fn().mockResolvedValue({});
    Stage.findByPk = jest.fn(1).mockResolvedValue({ idStage: 1 });
    Stage.findByPk = jest.fn(2).mockResolvedValue({ idStage: 2 });
    Flow.create = jest.fn().mockResolvedValue({
      idFlow: 1,
      ...flowData,
    });
    FlowStage.create = jest.fn().mockResolvedValue({});
    FlowUser.create = jest.fn().mockResolvedValue({});

    reqMock.body = flowData;
    await FlowController.update(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("update - flow does not exist (404)", async () => {
    Flow.findByPk = jest.fn().mockReturnValue(false);

    reqMock.body = { idFlow: 1 };
    await FlowController.update(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      message: "Fluxo 1 não existe!",
    });
    expect(resMock.status).toHaveBeenCalledWith(404);
  });

  test("update - internal server error (500)", async () => {
    const error = new Error("Internal Server Error");
    Flow.findByPk = jest.fn().mockRejectedValue(error);

    await FlowController.update(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("delete - remove flow (409)", async () => {
    FlowProcess.findAll = jest.fn().mockResolvedValue([{}]);
    await FlowController.delete(reqMock, resMock);
    expect(resMock.status).toHaveBeenCalledWith(409);
  });

  test("delete - remove flow (200)", async () => {
    FlowProcess.findAll = jest.fn().mockResolvedValue([]);
    FlowStage.destroy = jest.fn().mockResolvedValue();
    FlowUser.destroy = jest.fn().mockResolvedValue();
    Flow.destroy = jest.fn().mockResolvedValue(2);

    await FlowController.delete(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("delete - remove flow (200)", async () => {
    FlowProcess.findAll = jest.fn().mockResolvedValue([]);
    FlowStage.destroy = jest.fn().mockResolvedValue();
    FlowUser.destroy = jest.fn().mockResolvedValue();
    Flow.destroy = jest.fn().mockResolvedValue(0);

    await FlowController.delete(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(404);
  });

  test("delete - internal server error (500)", async () => {
    const error = new Error("Internal Server Error");
    FlowProcess.findAll = jest.fn().mockRejectedValue(error);

    await FlowController.delete(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("deleteFlowStage - destroy flowStage (200)", async () => {
    FlowStage.destroy = jest.fn().mockResolvedValue(2);

    reqMock.params = {
      idFlow: 1,
      ifStageA: 1,
      ifStageB: 1,
    };
    await FlowController.deleteFlowStage(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("deleteFlowStage - nothing to delete (404)", async () => {
    FlowStage.destroy = jest.fn().mockResolvedValue(0);

    reqMock.params = {
      idFlow: 1,
      ifStageA: 1,
      ifStageB: 1,
    };
    await FlowController.deleteFlowStage(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(404);
  });

  test("deleteFlowStage - internal server error (500)", async () => {
    const error = new Error("Internal Server Error");
    FlowStage.destroy = jest.fn().mockRejectedValue(error);

    await FlowController.deleteFlowStage(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("index - list all flows (200)", async () => {
    jest.spyOn(middleware, "tokenToUser").mockReturnValue({
      idUnit: 1,
      idRole: 5,
    });
    Flow.findAll = jest.fn().mockResolvedValue([{}]);
    Flow.count = jest.fn().mockResolvedValue(0);
    FlowStage.findAll = jest.fn().mockResolvedValue([
      {
        idFlowStage: 1,
        idStageA: 1,
        idStageB: 2,
        idFlow: 10,
        commentary: "",
      },
    ]);

    reqMock.query = {
      limit: 1,
      offset: 0,
      filter: 0,
    };
    await FlowController.index(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("index - internal server error (500)", async () => {
    const error = new Error("Internal Server Error");
    jest.spyOn(middleware, "tokenToUser").mockReturnValue({
      idUnit: 1,
      idRole: 5,
    });
    Flow.findAll = jest.fn().mockRejectedValue(error);

    reqMock.query = {
      limit: 1,
      offset: 0,
      filter: 0,
    };
    await FlowController.index(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("indexByRecord - list flowProcesses (200)", async () => {
    FlowProcess.findAll = jest.fn().mockReturnValue([{}]);

    await FlowController.indexByRecord(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith([{}]);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("indexByRecord - there are no flowProcesses (404)", async () => {
    FlowProcess.findAll = jest.fn().mockReturnValue([]);

    reqMock.params = { record: "123" };
    await FlowController.indexByRecord(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error: "Não há fluxos com esse processo",
      message: "Não há fluxos com o processo '123'",
    });
    expect(resMock.status).toHaveBeenCalledWith(404);
  });

  test("indexByRecord - internal server error (500)", async () => {
    const error = new Error("Internal Server Error");
    FlowProcess.findAll = jest.fn().mockRejectedValue(error);

    await FlowController.indexByRecord(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });
});
