import supertest from "supertest";
import { app } from "../TestApp";
import Note from "../../models/Notes.js";

jest.mock("../../models/Notes.js");

describe("role endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("new note and list existing", async () => {
    const testNote = {
      commentary: "obs",
      record: "123",
      idStageA: 1,
      idStageB: 2,
    };

    Note.create.mockResolvedValue(testNote);
    Note.findOne.mockResolvedValue(testNote);

    const response = await supertest(app).post("/newNote").send(testNote);
    expect(response.status).toBe(200);
    expect(response.body.record).toBe(testNote.record);

    const getResponse = await supertest(app).get(`/notes/${testNote.record}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.commentary).toBe(testNote.commentary);
  });

  test("new note and edit commentary", async () => {
    const testNote = {
      commentary: "obs",
      record: "123",
      idStageA: 1,
      idStageB: 2,
    };

    Note.create.mockResolvedValue(testNote);
    Note.findByPk.mockResolvedValue({
      set: jest.fn(),
      save: jest.fn(),
    });

    const response = await supertest(app).post("/newNote").send(testNote);
    expect(response.status).toBe(200);

    const updateResponse = await supertest(app)
      .put(`/updateNote/${response.body.idNote}`)
      .send({
        commentary: "obs2",
      });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.message).toEqual(
      "Observação atualizada com sucesso."
    );
  });

  test("new note and delete it", async () => {
    const testNote = {
      commentary: "obs",
      record: "123",
      idStageA: 1,
      idStageB: 2,
    };

    Note.create.mockResolvedValue(testNote);
    Note.findByPk.mockResolvedValue({ destroy: jest.fn() });

    const response = await supertest(app).post("/newNote").send(testNote);
    expect(response.status).toBe(200);

    const deleteResponse = await supertest(app).delete(
      `/deleteNote/${response.body.idNote}`
    );
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toEqual(
      "Observação deletada com sucesso."
    );
  });

  test("edit non-existent note (status 400)", async () => {
    const nonExistentNoteId = 123;

    Note.findByPk.mockResolvedValue(null);

    const updateResponse = await supertest(app)
      .put(`/updateNote/${nonExistentNoteId}`)
      .send({
        commentary: "obs2",
      });
    expect(updateResponse.status).toBe(400);
    expect(updateResponse.body.error).toEqual(
      `idNote ${nonExistentNoteId} não existe!`
    );
  });

  test("delete non-existent note (status 400)", async () => {
    const nonExistentNoteId = 123;

    Note.findByPk.mockResolvedValue(null);

    const deleteResponse = await supertest(app).delete(
      `/deleteNote/${nonExistentNoteId}`
    );
    expect(deleteResponse.status).toBe(400);
    expect(deleteResponse.body.error).toEqual(
      `idNote ${nonExistentNoteId} não existe!`
    );
  });

  test("new note - database error (status 500)", async () => {
    const testNote = {
      commentary: "obs",
      record: "123",
      idStageA: 1,
      idStageB: 2,
    };

    const errorMessage = "Database error";

    Note.create.mockRejectedValue(new Error(errorMessage));

    const response = await supertest(app).post("/newNote").send(testNote);
    expect(response.status).toBe(500);
    expect(response.body.message).toEqual(
      `Erro ao criar observação: Error: ${errorMessage}`
    );
  });

  test("edit note - database error (status 500)", async () => {
    const testNoteId = 123;
    const updatedCommentary = "obs2";

    const errorMessage = "Database error";

    Note.findByPk.mockRejectedValue(new Error(errorMessage));

    const updateResponse = await supertest(app)
      .put(`/updateNote/${testNoteId}`)
      .send({
        commentary: updatedCommentary,
      });
    expect(updateResponse.status).toBe(500);
    expect(updateResponse.body.message).toEqual(
      `Erro ao atualizar observação: Error: ${errorMessage}`
    );
  });

  test("delete note - database error (status 500)", async () => {
    const testNoteId = 123;

    const errorMessage = "Database error";

    Note.findByPk.mockResolvedValue({
      destroy: jest.fn().mockRejectedValue(new Error(errorMessage)),
    });

    const deleteResponse = await supertest(app).delete(
      `/deleteNote/${testNoteId}`
    );
    expect(deleteResponse.status).toBe(500);
    expect(deleteResponse.body.message).toEqual(
      `Erro ao deletar observação: Error: ${errorMessage}`
    );
  });
});
