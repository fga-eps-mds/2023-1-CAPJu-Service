"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "role",
      [
        {
          name: "Estagiário",
          accessLevel: 4,
          allowedActions: [
            "see-unit",
            "see-stage",
            "forward-stage",
            "backward-stage",
            "see-flow",
            "see-process",
            "create-process",
            "archive-process",
            "end-process",
            "edit-process",
            "delete-process",
            "edit-account",
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Servidor",
          accessLevel: 3,
          allowedActions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Juiz",
          accessLevel: 2,
          allowedActions: [
            "see-unit",
            "see-stage",
            "see-flow",
            "see-process",
            "edit-account",
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Diretor",
          accessLevel: 1,
          allowedActions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Administrador",
          accessLevel: 5,
          allowedActions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("role", null, {});
  },
};
