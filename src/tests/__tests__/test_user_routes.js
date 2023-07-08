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

  test("updateUser - update user email (200) ", async () => {
    const testUser = {
      fullName: "Fulano De Ciclano",
      cpf: "123456778900",
      email: "fulano@email.com",
      idUnit: 1,
      idRole: 1,
      accepted: true,
      set: jest.fn(),
      save: jest.fn(),
    };

    User.findByPk = jest.fn().mockResolvedValue(testUser);
    reqMock = {
      params: 1,
      body: {
        email: 'novofulano@email.com'
      }
    };

    await UserController.updateUser(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({ message: "Email atualizado com sucesso" });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("updateUser - user not found in update user email (204) ", async () => {
    User.findByPk = jest.fn().mockResolvedValue();
    reqMock = {
      params: 1,
      body: {
        email: 'novofulano@email.com'
      }
    };

    await UserController.updateUser(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({});
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("updateUser - error in update user (500) ", async () => {
    const error = new Error("Internal Error");
    User.findByPk = jest.fn().mockRejectedValue(error);
    reqMock = {
      params: 1,
      body: {
        email: 'novofulano@email.com'
      }
    };
    await UserController.updateUser(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      error,
      message: "Impossível atualizar email",
    });
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("updateRole - update user role (200) ", async () => {
    const testUser = {
      fullName: "Fulano De Ciclano",
      cpf: "123456778900",
      email: "fulano@email.com",
      idUnit: 1,
      idRole: 1,
      accepted: true,
      set: jest.fn(),
      save: jest.fn(),
    };
    User.findByPk = jest.fn().mockResolvedValue(testUser);
    reqMock = {
      body: {
        cpf: '123456778900',
        idRole: 3
      }
    };
    await UserController.updateRole(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({ message: "Papel atualizado com sucesso" });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("updateRole -  user not found in update user role (204) ", async () => {
    User.findByPk = jest.fn().mockResolvedValue();
    reqMock = {
      body: {
        cpf: '123456778900',
        idRole: 3
      }
    };
    await UserController.updateRole(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({});
    expect(resMock.status).toHaveBeenCalledWith(204);
  });


  test("updateRole - error in update role (500) ", async () => {
    const error = new Error("Internal Error");
    User.findByPk = jest.fn().mockRejectedValue(error);
    reqMock = {
      body: {
        cpf: '123456778900',
        idRole: 3
      }
    };
    await UserController.updateRole(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({
      message: "Usuário não atualizado!",
    });
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("editPassword - update user password (200) ", async () => {
    const testUser = {
      fullName: "Fulano De Ciclano",
      cpf: "123456778900",
      email: "fulano@email.com",
      password: "123Fulano",
      idUnit: 1,
      idRole: 1,
      accepted: true,
      set: jest.fn(),
      save: jest.fn(),
    };
    User.findByPk = jest.fn().mockResolvedValue(testUser);
    reqMock = {
      params: {
        id: '123456778900',
      },
      body: {
        oldPassword: "123Fulano",
        newPassword: "1234Fulano",
      }
    };
    await UserController.editPassword(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({ message: "Usuário atualizado com sucesso!" });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("editPassword - user not found in update user password (204) ", async () => {
    User.findByPk = jest.fn().mockResolvedValue();
    reqMock = {
      params: {
        id: '123456778900',
      },
      body: {
        oldPassword: "123Fulano",
        newPassword: "1234Fulano",
      }
    };
    await UserController.editPassword(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({});
    expect(resMock.status).toHaveBeenCalledWith(204);
  });

  test("editPassword - invalid password in update user password (204) ", async () => {
    const testUser = {
      fullName: "Fulano De Ciclano",
      cpf: "123456778900",
      email: "fulano@email.com",
      password: "12345Fulano",
      idUnit: 1,
      idRole: 1,
      accepted: true,
      set: jest.fn(),
      save: jest.fn(),
    };
    User.findByPk = jest.fn().mockResolvedValue(testUser);
    reqMock = {
      params: {
        id: '123456778900',
      },
      body: {
        oldPassword: "123Fulano",
        newPassword: "1234Fulano",
      }
    };
    await UserController.editPassword(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({ message: "Senha inválida!" });
    expect(resMock.status).toHaveBeenCalledWith(400);
  });

  test("editPassword - error in upadte user password (500) ", async () => {
    const error = new Error("Internal Error");
    User.findByPk = jest.fn().mockRejectedValue(error);
    reqMock = {
      params: {
        id: '123456778900',
      },
      body: {
        oldPassword: "123Fulano",
        newPassword: "1234Fulano",
      }
    };
    await UserController.editPassword(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({
      error,
      message: "Erro a atualizar usuário ",
    });
    expect(resMock.status).toHaveBeenCalledWith(500);

  });

  test("deleteByParam - delete user by cpf (200) ", async () => {
    const testUser = {
      fullName: "Fulano De Ciclano",
      cpf: "123456778900",
      email: "fulano@email.com",
      password: "123Fulano",
      idUnit: 1,
      idRole: 1,
      accepted: true,
      destroy: jest.fn(),
    };
    User.findByPk = jest.fn().mockResolvedValue(testUser);
    reqMock = {
      params: {
        id: '123456778900',
      },
    };
    await UserController.deleteByParam(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({ message: "Usuário apagado com sucesso" });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("deleteByParam - user not found in delete user by cpf (404) ", async () => {
    User.findByPk = jest.fn().mockResolvedValue();
    reqMock = {
      params: {
        id: '123456778900',
      },
    };
    await UserController.deleteByParam(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({ error: "Usuário não existe!" });
    expect(resMock.status).toHaveBeenCalledWith(404);
  });

  test("deleteByParam - error in delete user by cpf (500) ", async () => {
    const error = new Error("Internal Error");
    User.findByPk = jest.fn().mockRejectedValue(error);
    reqMock = {
      params: {
        id: '123456778900',
      },
    };
    await UserController.deleteByParam(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({
      error,
      message: "Erro ao apagar usuário",
    });
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("acceptRequest - accepted user request (200) ", async () => {
    const testUser = {
      fullName: "Fulano De Ciclano",
      cpf: "123456778900",
      email: "fulano@email.com",
      password: "123Fulano",
      idUnit: 1,
      idRole: 1,
      accepted: false,
      set: jest.fn(),
      save: jest.fn(),
    };
    User.findByPk = jest.fn().mockResolvedValue(testUser);
    reqMock = {
      params: {
        id: '123456778900',
      },
    };
    await UserController.acceptRequest(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({ message: "Usuário aceito com sucesso", });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("acceptRequest - user not found in accepted user request (200) ", async () => {
    User.findByPk = jest.fn().mockResolvedValue();
    reqMock = {
      params: {
        id: '123456778900',
      },
    };
    await UserController.acceptRequest(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({ error: "Usuário não existe" });
    expect(resMock.status).toHaveBeenCalledWith(404);
  });

  test("acceptRequest - user not found in accepted user request (500) ", async () => {
    const error = new Error("Internal Error");
    User.findByPk = jest.fn().mockRejectedValue(error);
    reqMock = {
      params: {
        id: '123456778900',
      },
    };
    await UserController.acceptRequest(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({
      error,
      message: "Falha ao aceitar usuário",
    });
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("deleteRequest - delete user request (200) ", async () => {
    const testUser = {
      fullName: "Fulano De Ciclano",
      cpf: "123456778900",
      email: "fulano@email.com",
      password: "123Fulano",
      idUnit: 1,
      idRole: 1,
      accepted: false,
      destroy: jest.fn(),
    };
    User.findByPk = jest.fn().mockResolvedValue(testUser);
    reqMock = {
      params: {
        id: '123456778900',
      },
    };
    await UserController.deleteRequest(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({ message: "Usuário não aceito foi excluído", });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("deleteRequest - user not found in delete user request (404) ", async () => {
    User.findByPk = jest.fn().mockResolvedValue();
    reqMock = {
      params: {
        id: '123456778900',
      },
    };
    await UserController.deleteRequest(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({ error: "Usuário não existe" });
    expect(resMock.status).toHaveBeenCalledWith(404);
  });

  test("deleteRequest - error in delete user request (500) ", async () => {
    const error = new Error("Internal Error");
    User.findByPk = jest.fn().mockRejectedValue(error);
    reqMock = {
      params: {
        id: '123456778900',
      },
    };
    await UserController.deleteRequest(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({
      error,
      message: "Erro ao negar pedido do usuário",
    });
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

  test("updateUserEmailAndPassword - update user emain and password (200) ", async () => {
    const testUser = {
      fullName: "Fulano De Ciclano",
      cpf: "123456778900",
      email: "fulano@email.com",
      password: "123Fulano",
      idUnit: 1,
      idRole: 1,
      accepted: true,
      set: jest.fn(),
      save: jest.fn(),
    };
    User.findByPk = jest.fn().mockResolvedValue(testUser);
    reqMock = {
      params: {
        id: '123456778900',
      },
      body: {
        email: "fulano@email.com",
        password: "12345Fulano",
      }
    };
    await UserController.updateUserEmailAndPassword(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith(testUser);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("updateUserEmailAndPassword - user not found in update user emain and password (404) ", async () => {
    User.findByPk = jest.fn().mockResolvedValue();
    reqMock = {
      params: {
        id: '123456778900',
      },
      body: {
        email: "fulano@email.com",
        password: "12345Fulano",
      }
    };
    await UserController.updateUserEmailAndPassword(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({ message: "Nenhum usuário foi encontrado" });
    expect(resMock.status).toHaveBeenCalledWith(404);
  });

  test("updateUserEmailAndPassword - error in update user email and password (500) ", async () => {
    const error = new Error("Internal Error");
    User.findByPk = jest.fn().mockRejectedValue(error);
    reqMock = {
      params: {
        id: '123456778900',
      },
      body: {
        email: "fulano@email.com",
        password: "12345Fulano",
      }
    };
    await UserController.updateUserEmailAndPassword(reqMock, resMock);
    expect(resMock.json).toHaveBeenCalledWith({
      error,
      message: "Impossível atualizar email",
    });
    expect(resMock.status).toHaveBeenCalledWith(500);
  });

});
