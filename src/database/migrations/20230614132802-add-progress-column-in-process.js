"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("process", "progress", {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: JSON.stringify([]),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("process", "progress");
  },
};
