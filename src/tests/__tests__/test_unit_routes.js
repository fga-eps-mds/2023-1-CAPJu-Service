import { ROLE } from "../../schemas/role.js";
import UnitController from "../../controllers/UnitController.js";
import Unit from "../../models/Unit.js";
import User from "../../models/User.js";

jest.mock("axios");

const reqMock = {};
const resMock = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

describe("unit endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("index - list all units", async () => {
    Unit.findAll = jest.fn().mockResolvedValue([]);
    Unit.count = jest.fn().mockResolvedValue(0);

    reqMock.query = {
      limit: 1,
      offset: 0,
      filter: 0,
    };
    await UnitController.index(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({ units: [], totalPages: 0 });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("index - failed to list (500)", async () => {
    const error = new Error("Internal Error");
    Unit.findAll = jest.fn().mockRejectedValue(error);

    await UnitController.index(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error,
      message: "Erro ao listar unidades",
    });
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("store - create unit ", async () => {
    const newUnit = {
      idUnit: 1,
      name: "New unit",
    };
    Unit.create = jest.fn().mockResolvedValue(newUnit);

    reqMock.body = newUnit.name;
    await UnitController.store(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(newUnit);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("store - failed to create unit (500)", async () => {
    const error = new Error("Internal Error");
    Unit.create = jest.fn().mockRejectedValue(error);

    reqMock.body = { name: "Unidade" };
    await UnitController.store(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error,
      message: "Erro ao criar unidade",
    });
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("update - set new name", async () => {
    const unit = {
      idUnit: 1,
      name: "New unit",
      set: jest.fn(),
      save: jest.fn(),
    };
    Unit.findByPk = jest.fn().mockResolvedValue(unit);

    reqMock.body = {
      idUnit: 1,
      name: "Unidade",
    };
    await UnitController.update(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(unit);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("update - failed to update unit (400)", async () => {
    Unit.findByPk = jest.fn().mockResolvedValue(false);

    reqMock.body = {
      idUnit: 1,
      name: "Unidade",
    };
    await UnitController.update(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      message: "Essa unidade não existe!",
    });
    expect(resMock.status).toHaveBeenCalledWith(404);
  });

  test("delete - unit has users (409)", async () => {
    const testUser = {
      fullName: "nome",
      cpf: "12345678912",
      email: "aa@bb.com",
      password: "pw123456",
      idUnit: 1,
      idRole: 3,
    };
    User.findAll = jest.fn().mockResolvedValue([testUser]);

    reqMock.body = { idUnit: 1 };
    await UnitController.delete(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error: "Há usuários na unidade",
      message: `Há 1 usuários nesta unidade.`,
    });
    expect(resMock.status).toHaveBeenCalledWith(409);
  });

  test("delete - unit does not exist (204)", async () => {
    User.findAll = jest.fn().mockResolvedValue([]);
    Unit.findByPk = jest.fn().mockResolvedValue(false);

    reqMock.body = { idUnit: 1 };
    await UnitController.delete(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error: "Essa unidade não existe!",
    });
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("delete - unit removed (200)", async () => {
    const unit = {
      idUnit: 1,
      name: "New unit",
      destroy: jest.fn(),
    };
    User.findAll = jest.fn().mockResolvedValue([]);
    Unit.findByPk = jest.fn().mockResolvedValue(unit);

    reqMock.body = { idUnit: unit.idUnit };
    await UnitController.delete(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(unit);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("delete - failed to delete unit (500)", async () => {
    const error = new Error("Internal Error");
    User.findAll = jest.fn().mockRejectedValue(error);

    reqMock.body = { idUnit: 1 };
    await UnitController.delete(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({ error });
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("getAdminsByUnitId - there are no admins (204)", async () => {
    User.findAll = jest.fn().mockResolvedValue(false);

    reqMock.params = { id: 1 };
    await UnitController.getAdminsByUnitId(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error: "Não há administradores para essa unidade",
    });
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("getAdminsByUnitId - there are admins (200)", async () => {
    const testUser = {
      fullName: "nome",
      cpf: "12345678912",
      email: "aa@bb.com",
      password: "pw123456",
      idUnit: 1,
      idRole: 1,
    };
    User.findAll = jest.fn().mockResolvedValue([testUser]);

    reqMock.params = { id: 1 };
    await UnitController.getAdminsByUnitId(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith([testUser]);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("setUnitAdmin - There are no accepted users for the unit (404)", async () => {
    User.findOne = jest.fn().mockResolvedValue(false);

    reqMock.body = {
      idUnit: 1,
      cpf: "12345678912",
    };
    await UnitController.setUnitAdmin(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      message: "Usuário aceito não existe nesta unidade",
    });
    expect(resMock.status).toHaveBeenCalledWith(404);
  });

  test("setUnitAdmin - Set accepted user as admin (200)", async () => {
    const testUser = {
      fullName: "nome",
      cpf: "12345678912",
      email: "aa@bb.com",
      password: "pw123456",
      idUnit: 1,
      idRole: 1,
    };
    User.findOne = jest.fn().mockResolvedValue({
      ...testUser,
      set: jest.fn(),
      save: jest.fn(),
    });

    reqMock.body = {
      idUnit: testUser.idUnit,
      cpf: testUser.cpf,
    };
    await UnitController.setUnitAdmin(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      fullName: "nome",
      cpf: "12345678912",
      email: "aa@bb.com",
      idUnit: 1,
      idRole: 1,
    });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("setUnitAdmin - Failed to set new admin (500)", async () => {
    const error = new Error("Internal Error");
    User.findOne = jest.fn().mockRejectedValue(error);

    await UnitController.setUnitAdmin(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error,
      message: "Erro ao configurar usuário como administrador",
    });
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("removeUnitAdmin - user not found (404)", async () => {
    User.findOne = jest.fn().mockResolvedValue(false);

    reqMock.body = {
      idUnit: 1,
      cpf: "12345678912",
    };
    await UnitController.removeUnitAdmin(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error: "Usuário não existe nesta unidade",
    });
    expect(resMock.status).toHaveBeenCalledWith(404);
  });

  test("removeUnitAdmin - user removed (200)", async () => {
    const testUser = {
      fullName: "nome",
      cpf: "12345678912",
      email: "aa@bb.com",
      password: "pw123456",
      idUnit: 1,
      idRole: 1,
      set: jest.fn(),
      save: jest.fn(),
    };
    User.findOne = jest.fn().mockResolvedValue(testUser);

    reqMock.body = {
      idUnit: testUser.idUnit,
      cpf: testUser.cpf,
    };
    await UnitController.removeUnitAdmin(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(testUser);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("removeUnitAdmin - Failed to remove admin (500)", async () => {
    const error = new Error("Internal Error");
    User.findOne = jest.fn().mockRejectedValue(error);

    await UnitController.removeUnitAdmin(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error: "Erro ao configurar usuário como administrador",
    });
    expect(resMock.status).toHaveBeenCalledWith(500);
  });
});
