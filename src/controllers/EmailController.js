import * as nodemailer from "nodemailer";
import path from "path";
class EmailController {
  async sendEmail() {
    const emails = [];
    const json = [
      {
        fluxo: "Fluxo de aposentadoria",
        processo: "132456",
        etapa: "Peritagem médica",
        dataInicio: "01/01/2023",
        duracao: 10,
        tempoAtrasado: 6,
        emails: ["capju.eps.mds@gmail.com"],
      },
      {
        fluxo: "Fluxo de aposentadoria",
        processo: "654321",
        etapa: "Vistoria médica",
        dataInicio: "10/01/2023	",
        duracao: 5,
        tempoAtrasado: 2,
        emails: ["capju.eps.mds@gmail.com"],
      },
      {
        fluxo: "Fluxo de aposentadoria",
        processo: "753951",
        etapa: "Aprovação do juiz",
        dataInicio: "10/01/2023",
        duracao: 5,
        tempoAtrasado: 2,
        emails: ["capju.eps.mds@gmail.com"],
      },
      {
        fluxo: "Fluxo de invalidez",
        processo: "745896",
        etapa: "Peritagem médica",
        dataInicio: "10/12/2022",
        duracao: 30,
        tempoAtrasado: 7,
        emails: ["capju.eps.mds@gmail.com"],
      },
      {
        fluxo: "Fluxo de invalidez",
        processo: "123321",
        etapa: "Peritagem médica",
        dataInicio: "02/01/2023",
        duracao: 8,
        tempoAtrasado: 7,
        emails: ["capju.eps.mds@gmail.com"],
      },
      {
        fluxo: "Fluxo de divorcio",
        processo: "741852",
        etapa: "Assinatura do advogado",
        dataInicio: "28/12/2023",
        duracao: 7,
        tempoAtrasado: 13,
        emails: ["capju.eps.mds@gmail.com"],
      },
      {
        fluxo: "Fluxo trabalhista",
        processo: "963852",
        etapa: "Pagamento",
        dataInicio: "10/01/2023",
        duracao: 3,
        tempoAtrasado: 4,
        emails: ["capju.eps.mds@gmail.com"],
      },
      {
        fluxo: "Fluxo trabalhista",
        processo: "4563211",
        etapa: "Recebimento",
        dataInicio: "18/01/2023",
        duracao: 1,
        tempoAtrasado: 2,
        emails: ["capju.eps.mds@gmail.com"],
      },
    ];

    const fluxos = json;

    json.forEach((item) => {
      item.emails.forEach((email) => {
        emails.push(email);
      });
    });

    var EmailFilter = emails.filter((este, i) => emails.indexOf(este) === i);

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "capju.eps.mds@gmail.com",
        pass: "gcoroacnwfmcfbus",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const __dirname = path.resolve();

    const message = {
      from: "capju.eps.mds@gmail.com",
      to: EmailFilter,
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
          ${fluxos
            .map((fluxo) => {
              return `
            <tr>
              <td>${fluxo.fluxo}</td>
              <td>${fluxo.processo}</td>
              <td>${fluxo.etapa}</td>
              <td>${fluxo.dataInicio}</td>
              <td>${fluxo.duracao}</td>
              <td>${fluxo.tempoAtrasado}</td>
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
          path: __dirname + "/src/emails/capju.png",
          cid: "capju",
        },
        {
          filename: "justica_federal.png",
          path: __dirname + "/src/emails/justica_federal.png",
          cid: "justica_federal",
        },
        {
          filename: "UnB.png",
          path: __dirname + "/src/emails/UnB.png",
          cid: "UnB",
        },
      ],
    };

    transport.sendMail(message, (err) => {
      if (err) {
        console.log("Error occurred. " + err.message);
        return process.exit(1);
      }
      console.log("Message sent!");
    });
  }
}

export default new EmailController();
