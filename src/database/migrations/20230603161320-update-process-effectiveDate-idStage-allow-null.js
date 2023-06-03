'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('process', 'effectiveDate', {
      allowNull: true,
      type: Sequelize.DATE
    });
    await queryInterface.changeColumn('process', 'idStage', {
      allowNull: true,
      type: Sequelize.INTEGER

    });  
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('process', 'effectiveDate', {
      allowNull: false,
      type: Sequelize.DATE

    });
    await queryInterface.changeColumn('process', 'idStage', {
      allowNull: false,
      type: Sequelize.INTEGER
    });

  }
};
