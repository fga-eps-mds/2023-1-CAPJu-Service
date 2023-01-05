'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('stage', { 
      idStage: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      idUnit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'unit', key: 'idUnit' },
        onDelete: 'RESTRICT'
      },
      name: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      duration: {
        type: Sequelize.SMALLINT,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.dropTable('stage');
  }
};
