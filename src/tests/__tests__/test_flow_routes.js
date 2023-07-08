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

  test("should return a 404 status with an error message if there are less than two sequences", async () => {
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

  test("get flow by id", async () => {
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

  test("get by id with sequence", async () => {
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

  test("get flow by process record", async () => {
    const record = "12345678901234567899";
    const flowData = { name: "Fluxo XPTO" };

    FlowProcess.findAll = jest.fn().mockResolvedValue([flowData]);

    reqMock.params = record;
    await FlowController.indexByRecord(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith([flowData]);
  });

  test("get all flow stages", async () => {
    FlowStage.findAll = jest.fn().mockResolvedValue([]);

    await FlowController.getFlowStages(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith([]);
  });

  test("get users to notify", async () => {
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

  test("update flow", async () => {
    const flowData = {
      idFlow: 1,
      name: "Fluxo AB",
      idUnit: 1,
      sequences: [
        { from: 1, to: 2, commentary: "Primeiro Comentário" },
        { from: 2, to: 3, commentary: "Segundo Comentário" },
      ],
      idUsersToNotify: ["12345678901", "12345678909"],
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

    reqMock.params = flowData;
    await FlowController.getUsersToNotify(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("delete flow", async () => {
    FlowProcess.findAll = jest.fn().mockResolvedValue([]);
    FlowStage.destroy = jest.fn().mockResolvedValue();
    FlowUser.destroy = jest.fn().mockResolvedValue();
    Flow.destroy = jest.fn().mockResolvedValue(2);

    await FlowController.delete(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("delete flow stage", async () => {
    FlowStage.destroy = jest.fn().mockResolvedValue(2);

    reqMock.params = {
      idFlow: 1,
      ifStageA: 1,
      ifStageB: 1,
    };
    await FlowController.deleteFlowStage(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("list all flows", async () => {
    jest.spyOn(middleware, "tokenToUser").mockReturnValue({
      idUnit: 1,
      idRole: 5,
    });
    Flow.findAll = jest.fn().mockResolvedValue([]);
    Flow.count = jest.fn().mockResolvedValue(0);
    FlowStage.findAll = jest.fn().mockResolvedValue([]);

    reqMock.query = {
      limit: 1,
      offset: 0,
      filter: 0,
    };
    await FlowController.index(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({ flows: [], totalPages: 0 });
  });
});
