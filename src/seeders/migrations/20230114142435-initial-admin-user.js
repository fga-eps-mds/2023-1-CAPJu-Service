"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "users",
      [
        {
          cpf: "12345678901",
          fullName: "Usuário Administrador Inicial",
          email: "email@emaill.com",
          password: "123Teste",
          idUnit: 1,
          accepted: true,
          idRole: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          cpf: "12345678909",
          fullName: "Usuário Não Aceito Inicial",
          email: "email@email.com",
          password: "123Testen",
          idUnit: 1,
          accepted: false,
          idRole: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
