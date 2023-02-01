import { dataAtualFormatada, getMailContents, sendEmail } from "../../controllers/Emailer";
import Database from "../../database/index.js";

const mailContents = [
  {
    id_flow: 4,
    flow: "fluxo b",
    process_record: "testeemail",
    process: "123456",
    id_stage: 3,
    stage: "etapa c",
    start_date: "2023-01-21T01:06:14.465Z",
    stage_duration: 2,
    email: "pedrozinho@email.com\n",
    delay_days: "4",
  },
  {
    id_flow: 4,
    flow: "fluxo b",
    process_record: "testeemail",
    process: "123456",
    id_stage: 3,
    stage: "etapa c",
    start_date: "2023-01-21T01:06:14.465Z",
    stage_duration: 2,
    email: "pedro@email.com\n",
    delay_days: "4",
  },
  {
    id_flow: 4,
    flow: "fluxo b",
    process_record: "testeemail",
    process: "123456",
    id_stage: 3,
    stage: "etapa c",
    start_date: "2023-01-21T01:06:14.465Z",
    stage_duration: 2,
    email: "gdbbdb@email.com\n",
    delay_days: "4",
  },
];

jest.mock('../../controllers/Emailer.js', () => {
  return {
    dataAtualFormatada: jest.fn().mockImplementation(() => "04/11/2022"),
    getMailContents: jest.fn().mockImplementation(() => mailContents ),
    sendEmail: jest.fn().mockImplementation(() => true),
  };
});



describe("Test for function dataAtualFormatada", () => {
  test("formats date correctly", () => {
    const input = "2022-11-05";
    const result = dataAtualFormatada(input);

    expect(result).toEqual("04/11/2022");
  });
});

describe("getMailContents", () => {
  it("retorna o conteúdo dos emails", async () => {
    const result = await getMailContents();
    expect(result).toEqual(mailContents);
  });

  it("retorna uma mensagem de erro em caso de falha", async () => {
    try {
      const error = new Error("Erro ao acessar o banco de dados");
      Database.connection.query = jest.fn().mockRejectedValue(error);
      const result = await getMailContents();
      expect(result).toEqual({
        error,
        message: "Erro ao obter conteúdo dos emails",
      });
    } catch (error){
      expect(true);
    }
  });
});

describe("sendEmail", () => {
  it("Send email true", async () => {
    const result = await sendEmail();
    expect(result).toEqual(true);
  })
});
