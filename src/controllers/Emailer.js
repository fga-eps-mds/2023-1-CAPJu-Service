import * as nodemailer from "nodemailer";
import path from "path";
import Database from "../database/index.js";
import { QueryTypes } from "sequelize";
import dotenv from "dotenv";
import { queryMailContents } from "../utils/queryMailContents.js";

dotenv.config();

const senha = process.env.CAPJU_EMAIL_PASSWORD;

export function dataAtualFormatada(data) {
  data = new Date(data);
  var dia = data.getDate().toString().padStart(2, "0");
  var mes = (data.getMonth() + 1).toString().padStart(2, "0");
  var ano = data.getFullYear();
  return dia + "/" + mes + "/" + ano;
}

export async function getMailContents() {
  try {
    const mailContents = await Database.connection.query(queryMailContents, {
      type: QueryTypes.SELECT,
    });
    return mailContents;
  } catch (error) {
    console.log(error);
    return {
      error,
      message: "Erro ao obter conteúdo dos emails",
    };
  }
}

export async function sendEmail() {
  const emails = [];
  let process = [];
  let json;
  json = await getMailContents();

  if (json.length == 0) {
    console.log("Não há processos atrasados");
    return true;
  }
  if (!senha) {
    console.log("Não há senha");
    return false;
  }

  json.forEach((item) => {
    emails.push(item.email);
  });

  let emailFilter = emails.filter(
    (email, idx) => emails.indexOf(email) === idx
  );

  for (let i = 0; i < emailFilter.length; i++) {
    json.forEach((item) => {
      if (emailFilter[i] === item.email) {
        process.push(item);
      }
    }); // FIM FOREACH
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "capju.eps.mds@gmail.com",
        pass: senha,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const __dirname = path.resolve();
    const message = {
      from: "capju.eps.mds@gmail.com",
      to: emailFilter[i],
      subject: "CAPJU - relatório de processos atrasados",
      text: "Olá, esse é um e-mail automático para informar os processos atrasados.",
      html: `
              <!DOCTYPE html>
              <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>
            <style type="text/css">
              * {
                box-sizing: border-box;
                -webkit-box-sizing: border-box;
                -moz-box-sizing: border-box;
              }
              body {
                font-family: Helvetica;
                -webkit-font-smoothing: antialiased;
              }
              h2 {
                text-align: center;
                font-size: 18px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: white;
                padding: 30px 0;
              }
              /* Table Styles */
              .table-wrapper {
                margin: 10px 70px 70px;
                box-shadow: 0px 35px 50px rgba(0, 0, 0, 0.2);
              }
              .fl-table {
                border-radius: 5px;
                font-size: 12px;
                font-weight: normal;
                border: none;
                border-collapse: collapse;
                width: 70%;
                max-width: 100%;
                white-space: nowrap;
                background-color: #f8f8f8;
              }
              .fl-table td,
              .fl-table th {
                text-align: center;
                padding: 8px;
              }
              .fl-table td {
                border-right: 1px solid #f8f8f8;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="table-wrapper">
              <p>Olá, segue a lista de processos atrasados até a data de envio deste e-mail.</p>
              <table class="fl-table">
                <thead>
                  <tr>
                    <th style="background: #363c7a; color: #ffffff">Fluxo</th>
                    <th style="background: #138f4a; color: #ffffff">Processo</th>
                    <th style="background: #363c7a; color: #ffffff">Etapa</th>
                    <th style="background: #138f4a; color: #ffffff">Data de inicio</th>
                    <th style="background: #363c7a; color: #ffffff">
                      Duração (em dias)
                    </th>
                    <th style="background: #138f4a; color: #ffffff">
                      Tempo atrasado (em dias)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${process
                    .map((fluxo) => {
                      return `
                    <tr>
                      <td>${fluxo.flow}</td>
                      <td>${fluxo.process_record}</td>
                      <td>${fluxo.stage}</td>
                      <td>${dataAtualFormatada(fluxo.start_date)}</td>
                      <td>${fluxo.stage_duration}</td>
                      <td>${fluxo.delay_days}</td>
                    </tr>
                    `;
                    })
                    .join("")}
                </tbody>
              </table>
              <figure>
                <img style="width:130px" src="cid:capju" />
                <img style="width:130px" src="cid:UnB" />
                <img style="width:130px" src="cid:justica_federal" />
              </figure>
            </div>
          </body>
        </html>`,
      attachments: [
        {
          filename: "capju.png",
          path: __dirname + "/src/assets/capju.png",
          cid: "capju",
        },
        {
          filename: "justica_federal.png",
          path: __dirname + "/src/assets/justica_federal.png",
          cid: "justica_federal",
        },
        {
          filename: "UnB.png",
          path: __dirname + "/src/assets/UnB.png",
          cid: "UnB",
        },
      ],
    };
    try {
      transport.sendMail(message);
      process = [];
    } catch (err) {
      console.log("Error occurred. " + err.message);
      return false;
    }
  }
  return true;
}
