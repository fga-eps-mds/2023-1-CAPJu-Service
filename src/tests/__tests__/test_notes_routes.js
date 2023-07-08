import NoteController from "../../controllers/NoteController.js";
import Note from "../../models/Note.js";

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

  test("newNote - create new note", async () => {
    const testNote = {
      commentary: "obs",
      record: "123",
      idStageA: 1,
      idStageB: 2,
    };

    Note.create = jest.fn().mockResolvedValue(testNote);

    reqMock.body = testNote;
    await NoteController.newNote(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith(testNote);
  });

  test("newNote - failed to create new note", async () => {
    const testNote = {
      commentary: "obs",
      record: "123",
      idStageA: 1,
      idStageB: 2,
    };

    const errorMessage = "Database error";
    Note.create = jest.fn().mockRejectedValue(new Error(errorMessage));

    reqMock.body = testNote;
    await NoteController.newNote(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith({
      message: `Erro ao criar observação: Error: ${errorMessage}`,
    });
  });

  test("index - list existing notes", async () => {
    const testNote = {
      commentary: "obs",
      record: "123",
      idStageA: 1,
      idStageB: 2,
    };

    Note.findAll = jest.fn().mockResolvedValue(testNote);

    reqMock.params = { record: testNote.record };
    await NoteController.index(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith(testNote);
  });

  test("index - failed to list existing notes", async () => {
    const errorMessage = "Database error";
    Note.findAll = jest.fn().mockRejectedValue(new Error(errorMessage));

    reqMock.params = { record: "123" };
    await NoteController.index(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith({
      message: `Erro ao buscar observação: Error: ${errorMessage}`,
    });
  });

  test("update - change commentary", async () => {
    const testNote = {
      commentary: "obs",
      record: "123",
      idStageA: 1,
      idStageB: 2,
    };

    Note.findByPk = jest.fn().mockResolvedValue({
      set: jest.fn(),
      save: jest.fn(),
    });

    reqMock.body = { commentary: testNote.commentary };
    reqMock.params = { idNote: 1 };
    await NoteController.update(reqMock, resMock);

    expect(resMock.json).toHaveBeenCalledWith({
      message: "Observação atualizada com sucesso.",
    });
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  test("update - failed to change commentary", async () => {
    const errorMessage = "Database error";
    Note.findByPk = jest.fn().mockRejectedValue(new Error(errorMessage));

    reqMock.body = { commentary: "obs2" };
    reqMock.params = { idNote: 1 };
    await NoteController.update(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith({
      message: `Erro ao atualizar observação: Error: ${errorMessage}`,
    });
  });

  test("update - note not found", async () => {
    Note.findByPk = jest.fn().mockResolvedValue(false);

    const idNote = 1;
    reqMock.body = { commentary: "obs2" };
    reqMock.params = { idNote };
    await NoteController.update(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.json).toHaveBeenCalledWith({
      error: `idNote ${idNote} não existe!`,
    });
  });

  test("delete - remove note", async () => {
    Note.findByPk = jest.fn().mockResolvedValue({ destroy: jest.fn() });

    reqMock.params = { idNote: 1 };
    await NoteController.delete(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({
      message: "Observação deletada com sucesso.",
    });
  });

  test("delete - failed to remove note", async () => {
    const errorMessage = "Database error";
    Note.findByPk = jest.fn().mockRejectedValue(new Error(errorMessage));

    reqMock.params = { idNote: 1 };
    await NoteController.delete(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith({
      message: `Erro ao deletar observação: Error: ${errorMessage}`,
    });
  });

  test("delete - note not found", async () => {
    Note.findByPk = jest.fn().mockResolvedValue(false);

    const idNote = 1;
    reqMock.params = { idNote };
    await NoteController.delete(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.json).toHaveBeenCalledWith({
      error: `idNote ${idNote} não existe!`,
    });
  });
});
