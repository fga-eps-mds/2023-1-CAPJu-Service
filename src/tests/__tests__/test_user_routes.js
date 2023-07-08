import UserController from "../../controllers/UserContoller";
import User from "../../models/User";
import * as middleware from "../../middleware/authMiddleware.js";

jest.mock("axios");

let reqMock = {};
const resMock = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

describe("user endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("login - user authenticated (200) ", async () => {
    const testUser = {
      cpf: "123456778900",
      password: "123Fulano",
      accepted: true,
      set: jest.fn(),
      save: jest.fn(),
    };

    User.findByPk = jest.fn().mockResolvedValue(testUser);
    reqMock.body = testUser;
    await UserController.login(reqMock, resMock);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("login - user not found (204) ", async () => {
    const testUser = {
      cpf: "",
      password: "123Fulano",
    };

    User.findByPk = jest.fn().mockResolvedValue(testUser.cpf);
    reqMock.body = testUser;
    await UserController.login(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({});
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("login - user not accepted (401) ", async () => {
    const testUser = {
      cpf: "123456778900",
      password: "123Fulano",
    };

    User.findByPk = jest.fn().mockResolvedValue(testUser.cpf);
    reqMock.body = testUser;
    await UserController.login(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({
      message: "Usuário não aceito",
    });
    expect(resMock.status).toHaveBeenCalledWith(401);
  });

  test("login - user not authenticated (401) ", async () => {
    const testUser = {
      cpf: "123456778900",
      password: "123Fulano",
      accepted: true,
      set: jest.fn(),
      save: jest.fn(),
    };

    const wrongUserData = {
      cpf: "123456778900",
      password: "1234Fulano",
      accepted: true,
      set: jest.fn(),
      save: jest.fn(),
    };

    User.findByPk = jest.fn().mockResolvedValue(testUser);
    reqMock.body = wrongUserData;
    await UserController.login(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({
      error: "Impossível autenticar",
      message: "Senha ou usuário incorretos",
    });
    expect(resMock.status).toHaveBeenCalledWith(401);
  });

  test("login - error in login (500) ", async () => {
    const error = new Error("Internal Error");
    User.findByPk = jest.fn().mockRejectedValue(error);

    const testUser = {
      fullName: "Fulano De Ciclano",
      cpf: "123456778900",
      email: "fulano@email.com",
      password: "123Fulano",
      idUnit: 1,
      idRole: 1,
    };
    reqMock.body = testUser;
    await UserController.login(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error,
      message: "erro inesperado",
    });
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("getByIdParam - get user by id (200)", async () => {
    const testUser = {
      fullName: "Fulano De Ciclano",
      cpf: "123456778900",
      email: "fulano@email.com",
      password: "123Fulano",
      idUnit: 1,
      idRole: 1,
      firstLogin: false,
      accepted: true,
    };

    const testUserRes = {
      fullName: "Fulano De Ciclano",
      cpf: "123456778900",
      email: "fulano@email.com",
      idUnit: 1,
      idRole: 1,
      firstLogin: false,
      accepted: true,
    };

    reqMock.params = { cpf: "123456778900" };
    User.findByPk = jest.fn().mockResolvedValue(testUser);
    await UserController.getByIdParam(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith(testUserRes);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("getByIdParam - user not found (204)", async () => {
    reqMock.params = { cpf: "123456778900" };
    User.findByPk = jest.fn().mockResolvedValue();
    await UserController.getByIdParam(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({ error: "Usuário não existe" });
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("getByIdParam - error in get user (500)", async () => {
    const error = new Error("Internal Error");
    User.findByPk = jest.fn().mockRejectedValue(error);
    reqMock.params = { cpf: "123456778900" };
    await UserController.getByIdParam(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error,
      message: "Erro ao buscar usuário",
    });
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("allUser - get all accepted users (200)", async () => {
    const testUser = [
      {
        fullName: "Fulano De Ciclano",
        cpf: "123456778900",
        email: "fulano@email.com",
        password: "123Fulano",
        idUnit: 1,
        idRole: 1,
        firstLogin: false,
        accepted: true,
      },
    ];

    const testUserRes = [
      {
        fullName: "Fulano De Ciclano",
        cpf: "123456778900",
        email: "fulano@email.com",
        idUnit: 1,
        idRole: 1,
        accepted: true,
      },
    ];

    jest.spyOn(middleware, "tokenToUser").mockReturnValue({
      idUnit: 1,
      idRole: 5,
    });

    reqMock = {
      query: {
        accepted: "true",
        limit: 1,
        offset: 0,
      },
    };
    User.findAll = jest.fn().mockResolvedValue(testUser);
    User.count = jest.fn().mockResolvedValue(1);
    await UserController.allUser(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({
      users: testUserRes || [],
      totalPages: 1,
    });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("allUser - get all not accepted users (200)", async () => {
    const testUser = [
      {
        fullName: "Fulano De Ciclano",
        cpf: "123456778900",
        email: "fulano@email.com",
        password: "123Fulano",
        idUnit: 1,
        idRole: 1,
        firstLogin: false,
        accepted: true,
      },
    ];

    const testUserRes = [
      {
        fullName: "Fulano De Ciclano",
        cpf: "123456778900",
        email: "fulano@email.com",
        idUnit: 1,
        idRole: 1,
        accepted: true,
      },
    ];

    jest.spyOn(middleware, "tokenToUser").mockReturnValue({
      idUnit: 1,
      idRole: 5,
    });

    reqMock = {
      query: {
        accepted: "false",
        limit: 1,
        offset: 0,
      },
    };
    User.findAll = jest.fn().mockResolvedValue(testUser);
    User.count = jest.fn().mockResolvedValue(1);
    await UserController.allUser(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({
      users: testUserRes || [],
      totalPages: 1,
    });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("allUser - get all users (200)", async () => {
    const testUser = [
      {
        fullName: "Fulano De Ciclano",
        cpf: "123456778900",
        email: "fulano@email.com",
        password: "123Fulano",
        idUnit: 1,
        idRole: 1,
        firstLogin: false,
        accepted: true,
      },
    ];

    const testUserRes = [
      {
        fullName: "Fulano De Ciclano",
        cpf: "123456778900",
        email: "fulano@email.com",
        idUnit: 1,
        idRole: 1,
        accepted: true,
      },
    ];

    jest.spyOn(middleware, "tokenToUser").mockReturnValue({
      idUnit: 1,
      idRole: 5,
    });

    reqMock = {
      query: {
        limit: 1,
        offset: 0,
      },
    };
    User.findAll = jest.fn().mockResolvedValue(testUser);
    await UserController.allUser(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({
      users: testUserRes,
    });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("allUser - accepted not defined (400)", async () => {
    const testUser = [
      {
        fullName: "Fulano De Ciclano",
        cpf: "123456778900",
        email: "fulano@email.com",
        password: "123Fulano",
        idUnit: 1,
        idRole: 1,
        firstLogin: false,
        accepted: true,
      },
    ];

    jest.spyOn(middleware, "tokenToUser").mockReturnValue({
      idUnit: 1,
      idRole: 5,
    });

    reqMock = {
      query: {
        accepted: "undefined",
        limit: 1,
        offset: 0,
      },
    };
    User.findAll = jest.fn().mockResolvedValue(testUser);
    User.count = jest.fn().mockResolvedValue(1);
    await UserController.allUser(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({
      message: `O parâmetro accepted deve ser 'true' ou 'false'`,
    });
    expect(resMock.status).toHaveBeenCalledWith(400);
  });

  test("alluser - error in get all users (500)", async () => {
    const error = new Error("Internal Error");
    User.findAll = jest.fn().mockRejectedValue(error);
    jest.spyOn(middleware, "tokenToUser").mockReturnValue({
      idUnit: 1,
      idRole: 5,
    });

    reqMock = {
      query: {
        limit: 1,
        offset: 0,
      },
    };
    await UserController.allUser(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error,
      message: "Erro ao listar usuários aceitos ou não",
    });
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("store - create new user (200) ", async () => {
    const testUser = {
      fullName: "Fulano De Ciclano",
      cpf: "123456778900",
      email: "fulano@email.com",
      password: "123Fulano",
      idUnit: 1,
      idRole: 1,
    };

    User.create = jest.fn().mockResolvedValue(testUser);
    reqMock.body = testUser;
    await UserController.store(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith(testUser);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("store - error in create new user (400) ", async () => {
    const error = new Error("SequelizeUniqueConstraintError");
    error.name = "SequelizeUniqueConstraintError";
    error.errors = [
      {
        path: null,
      },
    ];
    User.create = jest.fn().mockRejectedValue(error);

    const testUser = {
      fullName: "Fulano De Ciclano",
      cpf: "123456778900",
      email: "fulano@email.com",
      password: "123Fulano",
      idUnit: 1,
      idRole: 1,
    };
    reqMock.body = testUser;
    await UserController.store(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error: "Campo duplicado.",
      message: "Já existe um registro duplicado.",
    });
    expect(resMock.status).toHaveBeenCalledWith(400);
  });

  test("store - error in create new user (500) ", async () => {
    const error = new Error("Internal Error");
    User.create = jest.fn().mockRejectedValue(error);

    const testUser = {
      fullName: "Fulano De Ciclano",
      cpf: "123456778900",
      email: "fulano@email.com",
      password: "123Fulano",
      idUnit: 1,
      idRole: 1,
    };
    reqMock.body = testUser;
    await UserController.store(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith(error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

});
