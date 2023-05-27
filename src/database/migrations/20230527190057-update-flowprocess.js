"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("flowProcess", "status", {
      type: Sequelize.ENUM({
        values: ['inProgress', 'archived','finished','notStarted']
    }),
    defaultValue: "notStarted",
    allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("flowProcess", "status");
  },
};