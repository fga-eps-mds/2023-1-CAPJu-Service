import RoleController from "../../controllers/RoleController.js";
import Role from "../../models/Role.js";

jest.mock("axios");

const reqMock = {};
const resMock = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

describe("role endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("index - list all roles (200)", async () => {
    Role.findAll = jest.fn().mockResolvedValue([]);

    await RoleController.index(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith([]);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("index - return message (204)", async () => {
    Role.findAll = jest.fn().mockResolvedValue(false);

    await RoleController.index(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({ message: "Não Existe cargo" });
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("getById - return message (204)", async () => {
    Role.findByPk = jest.fn().mockResolvedValue(false);

    reqMock.params = { id: 1 };
    await RoleController.getById(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith([]);
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("getById - return message (200)", async () => {
    const role = {
      idRole: 1,
      name: "juiz",
      accessLevel: 1,
      allowedActions: [],
    };

    reqMock.params = { id: role.idRole };
    Role.findByPk = jest.fn().mockResolvedValue(role);

    await RoleController.getById(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(role);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("updateRoleName - return empty role (204)", async () => {
    reqMock.body = {
      idRole: 1,
      name: "juiz",
    };
    Role.findByPk = jest.fn().mockResolvedValue(false);

    await RoleController.updateRoleName(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith([]);
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("updateRoleName - return updated role (200)", async () => {
    const role = {
      idRole: 1,
      name: "juiz",
      accessLevel: 1,
      allowedActions: [],
      set: jest.fn(),
      save: jest.fn(),
    };

    reqMock.body = {
      idRole: role.idRole,
      name: role.name,
    };
    Role.findByPk = jest.fn().mockResolvedValue(role);

    await RoleController.updateRoleName(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(role);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("updateRoleAllowedActions - return empty role ([])", async () => {
    reqMock.params = { idRole: 1 };
    reqMock.body = { allowedActions: [] };
    Role.findByPk = jest.fn().mockResolvedValue(false);

    await RoleController.updateRoleAllowedActions(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith([]);
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("updateRoleAllowedActions - return updated role (200)", async () => {
    const role = {
      idRole: 1,
      name: "juiz",
      accessLevel: 1,
      allowedActions: [],
      set: jest.fn(),
      save: jest.fn(),
    };

    reqMock.params = { idRole: role.idRole };
    reqMock.body = { allowedActions: role.allowedActions };
    Role.findByPk = jest.fn().mockResolvedValue(role);

    await RoleController.updateRoleAllowedActions(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(role);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("delete - return not found (404)", async () => {
    reqMock.body = { idRole: 1 };
    Role.findByPk = jest.fn().mockResolvedValue(false);

    await RoleController.delete(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(404);
  });

  test("delete - return destroyed role (200)", async () => {
    const role = {
      idRole: 1,
      name: "juiz",
      accessLevel: 1,
      allowedActions: [],
      destroy: jest.fn(),
    };
    reqMock.body = { idRole: 1 };
    Role.findByPk = jest.fn().mockResolvedValue(role);

    await RoleController.delete(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(role);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("delete - return destroyed role (200)", async () => {
    const role = {
      idRole: 1,
      name: "juiz",
      accessLevel: 1,
      allowedActions: [],
      destroy: jest.fn(),
    };
    reqMock.body = { idRole: 1 };
    Role.findByPk = jest.fn().mockResolvedValue(role);

    await RoleController.delete(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(role);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("store - create Role (200)", async () => {
    const role = {
      idRole: 1,
      name: "juiz",
      accessLevel: 1,
      allowedActions: [],
    };
    reqMock.body = role;
    Role.create = jest.fn().mockResolvedValue(role);

    await RoleController.store(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(role);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("store - internal server error (500)", async () => {
    const error = new Error("Internal Server Error");
    Role.create = jest.fn().mockRejectedValue(error);

    await RoleController.store(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });
});
