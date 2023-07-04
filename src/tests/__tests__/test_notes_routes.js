import { Database } from "../TestDatabase.js";
import "sequelize";
import supertest from "supertest";
import { app, injectDB } from "../TestApp";

describe("role endpoints", () => {
  beforeEach(async () => {
    const database = new Database();
    await database.migrate();
    await database.seed();
    injectDB(database);
  });

  test("new note and list existing", async () => {
    const testNote = {
      commentary: "obs",
      record: "123",
      idStageA: 1,
      idStageB: 2,
    };

    let response = await supertest(app).post("/newNote").send(testNote);
    expect(response.status).toBe(200);
    expect(response.body.record).toBe(testNote.record);

    response = await supertest(app).get(`/notes/${testNote.record}`);
    expect(response.status).toBe(200);
    expect(response.body.commentary).toBe(testNote.commentary);
  });

  test("new note and edit commentary", async () => {
    const testNote = {
      commentary: "obs",
      record: "123",
      idStageA: 1,
      idStageB: 2,
    };

    let response = await supertest(app).post("/newNote").send(testNote);
    expect(response.status).toBe(200);

    response = await supertest(app)
      .put(`/updateNote/${response.body.idNote}`)
      .send({
        commentary: "obs2",
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual("Observação atualizada com sucesso.");
  });

  test("new note and delete it", async () => {
    const testNote = {
      commentary: "obs",
      record: "123",
      idStageA: 1,
      idStageB: 2,
    };

    let response = await supertest(app).post("/newNote").send(testNote);
    expect(response.status).toBe(200);

    response = await supertest(app).delete(
      `/deleteNote/${response.body.idNote}`
    );
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual("Observação deletada com sucesso.");
  });
});
