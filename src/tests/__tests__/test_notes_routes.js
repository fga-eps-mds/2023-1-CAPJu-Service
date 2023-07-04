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
});
