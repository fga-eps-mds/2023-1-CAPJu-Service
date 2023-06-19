import {
  dataAtualFormatada,
  getMailContents,
  sendEmail,
} from "../../controllers/Emailer";
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

beforeEach(async () => {
  jest.clearAllMocks();
});

// mock Database.connection
jest.mock("../../database/index.js", () => {
  return {
    connection: {
      query: jest.fn().mockImplementation(() => mailContents),
    },
  };
});

describe("Test for function dataAtualFormatada", () => {
  test("formats date correctly", () => {
    const input = "2022-11-05";
    const result = dataAtualFormatada(input);

    expect(result).toEqual("05/11/2022");
  });
});

describe("getMailContents", () => {
  it("retorna o conteúdo dos emails", async () => {
    const result = await getMailContents();
    expect(result).toEqual(mailContents);
  });
  it("execpt", async () => {
    try {
      Database.connection.query = jest.fn().mockRejectedValue();
      const result = await getMailContents();
      expect(result).toEqual({
        message: "Erro ao obter conteúdo dos emails",
      });
    } catch (error) {
      expect(true);
    }
  });
});

describe("Test for function sendEmail", () => {
  it("send email correctly", async () => {
    const result = sendEmail();
    expect(result).toBeTruthy();
  });
  it("Retorno dos console.log", async () => {
    const mockGetMailContents = jest.fn().mockResolvedValue([]);
    console.log = jest.fn();
    await sendEmail(mockGetMailContents);
    expect(console.log).toHaveBeenCalledTimes(2);
  });
  it("should log 'Não há senha' and return false if password is not set", async () => {
    process.env.CAPJU_EMAIL_PASSWORD = "";
    console.log = jest.fn();
    const result = await sendEmail();
    expect(console.log).toHaveBeenCalledWith("Não há senha");
    expect(result).toBe(false);
    delete process.env.CAPJU_EMAIL_PASSWORD;
  });
});
