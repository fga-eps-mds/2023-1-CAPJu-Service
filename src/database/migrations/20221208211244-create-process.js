'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('process', { 
      record: {
        type: Sequelize.STRING(20),
        primaryKey: true,
        allowNull: false,
      },
      nickname: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      effectiveDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      idUnit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'unit', key: 'idUnit' },
        onDelete: 'RESTRICT'
      },
      idStage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'stage', key: 'idStage' },
        onDelete: 'RESTRICT'
      },
      idPrioritised: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'prioritised', key: 'idPrioritised' },
        onDelete: 'RESTRICT'
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
    await queryInterface.dropTable('process');
  }
};
