import StageController from "../../controllers/StageController";
import Stage from "../../models/Stage";
import FlowStage from "../../models/FlowStage";
import * as middleware from "../../middleware/authMiddleware.js";

jest.mock("axios");

let reqMock = {};
const resMock = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

describe("stage endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("index - index stages (200)", async () => {
    const testStage = [
      {
        idStage: 1,
        name: "Stage A",
        idUnit: 1,
        duration: 1,
      },
    ];

    jest.spyOn(middleware, "tokenToUser").mockReturnValue({
      idUnit: 1,
      idRole: 5,
    });
    Stage.findAll = jest.fn().mockResolvedValue(testStage);
    Stage.count = jest.fn().mockResolvedValue(1);

    reqMock = {
      query: {
        limit: 1,
        offset: 0,
      },
    };
    await StageController.index(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({
      stages: testStage,
      totalPages: 1,
    });
  });

  test("index - not stages (204)", async () => {
    jest.spyOn(middleware, "tokenToUser").mockReturnValue({
      idUnit: 1,
      idRole: 5,
    });
    Stage.findAll = jest.fn().mockResolvedValue([]);
    Stage.count = jest.fn().mockResolvedValue(0);

    reqMock = {
      query: {
        limit: 1,
        offset: 0,
      },
    };
    await StageController.index(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith([]);
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("getById - get stage by id (200)", async () => {
    const testStage = {
      idStage: 1,
      name: "Stage A",
      idUnit: 1,
      duration: 1,
    };

    reqMock.params = { idStage: 1 };
    Stage.findByPk = jest.fn().mockResolvedValue(testStage);

    await StageController.getById(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith(testStage);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("getById - failed to getById (204)", async () => {
    reqMock.params = { idStage: null };
    Stage.findByPk = jest.fn().mockResolvedValue();
    await StageController.getById(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({});
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("Store - create new stage (200)", async () => {
    const testStage = {
      name: "Stage A",
      idUnit: "1",
      duration: 1,
    };

    Stage.create = jest.fn().mockResolvedValue(testStage);
    reqMock.body = testStage;
    await StageController.store(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(testStage);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("Delete - failed to delete (204) ", async () => {
    const testStage = [
      {
        idStage: 1,
        name: "Stage A",
        idUnit: 1,
        duration: 1,
      },
    ];

    reqMock.params = { id: 1 };
    FlowStage.findAll = jest.fn().mockResolvedValue(testStage);
    await StageController.delete(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({});
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("Store - failed to create (500)", async () => {
    const error = new Error("Internal Error");
    Stage.create = jest.fn().mockRejectedValue(error);

    await StageController.store(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("Delete - stage deleted (200)", async () => {
    const testStage = {
      idStage: 1,
      name: "Stage A",
      idUnit: 1,
      duration: 1,
      destroy: jest.fn(),
    };
    FlowStage.findAll = jest.fn().mockResolvedValue([]);
    Stage.findByPk = jest.fn().mockResolvedValue(testStage);

    reqMock.params = { id: 1 };
    await StageController.delete(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(testStage);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("Delete - failed to delete (204)", async () => {
    const testStage = [];

    reqMock.params = { id: 1 };
    FlowStage.findAll = jest.fn().mockResolvedValue(testStage);
    Stage.findByPk = jest.fn().mockResolvedValue();
    await StageController.delete(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({});
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("Delete - failed to delete (500)", async () => {
    const error = new Error("Internal Error");
    FlowStage.findAll = jest.fn().mockRejectedValue(error);

    reqMock.params = { id: 1 };
    await StageController.delete(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });
});
