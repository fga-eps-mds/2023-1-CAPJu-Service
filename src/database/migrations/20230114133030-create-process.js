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
        allowNull: true,
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
      idPriority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'priority', key: 'idPriority' },
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
