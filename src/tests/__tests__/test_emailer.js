import * as Emailer from "../../controllers/Emailer";
import Database from "../../database/index.js";
import * as nodemailer from 'nodemailer';
import * as path from 'path';

test.skip("formats date correctly", () => {
  const input = "2022-11-05";
  const expectedOutput = "04/11/2022";
  const result = Emailer.dataAtualFormatada(input);

  expect(result).toEqual(expectedOutput);
});

describe.skip("getMailContents", () => {
  it("retorna o conteúdo dos emails", async () => {
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
        email: "pedrozinho.herique11@gmail.com\n",
        delay_days: "4",
      },
    ];

    // Simula a resposta da consulta ao banco de dados
    Database.connection.query = jest.fn().mockResolvedValue(mailContents);

    const result = await Emailer.getMailContents();

    expect(result).toEqual(mailContents);
  });

  it("retorna uma mensagem de erro em caso de falha", async () => {
    const error = new Error("Erro ao acessar o banco de dados");

    // Simula a resposta da consulta ao banco de dados
    Database.connection.query = jest.fn().mockRejectedValue(error);

    const result = await Emailer.getMailContents();

    expect(result).toEqual({
      error,
      message: "Erro ao obter conteúdo dos emails",
    });
  });
});


describe.skip("sendEmail", () => {
    it("retorna true", async () => {
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
  
      // Simula a resposta da consulta ao banco de dados
      Database.connection.query = jest.fn().mockResolvedValue(mailContents);

      const senha = process.env.CAPJU_EMAIL_PASSWORD;
      if(!senha){
        await expect(Emailer.sendEmail()).resolves.toBe(false);
      } else {
        await expect(Emailer.sendEmail()).resolves.toBe(true);
      }
    });
  
    it("retorna uma mensagem de erro em caso de falha", async () => {
      const error = new Error("Erro ao acessar o banco de dados");
  
      // Simula a resposta da consulta ao banco de dados
      Database.connection.query = jest.fn().mockRejectedValue(error);
  
      const result = await Emailer.getMailContents();
  
      expect(result).toEqual({
        error,
        message: "Erro ao obter conteúdo dos emails",
      });
    });
  });



