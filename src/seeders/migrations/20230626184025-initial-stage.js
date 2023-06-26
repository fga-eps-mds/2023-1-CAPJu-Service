"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "stage",
      [
        {
          idUnit: 1,
          name: "Etapa A",
          duration: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          idUnit: 1,
          name: "Etapa B",
          duration: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          idUnit: 1,
          name: "Etapa C",
          duration: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("stage", null, {});
  },
};
