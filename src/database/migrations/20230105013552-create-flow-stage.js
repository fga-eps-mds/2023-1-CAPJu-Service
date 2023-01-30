'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('flowStage', {
      idFlowStage: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      idStageA: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'stage', key: 'idStage' },
        onDelete: 'RESTRICT'
      },
      idStageB: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'stage', key: 'idStage' },
        onDelete: 'RESTRICT'
      },
      idFlow: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'flow', key: 'idFlow' },
        onDelete: 'RESTRICT'
      },
      commentary: {
        type: Sequelize.STRING(100),
        allowNull: true
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
    await queryInterface.dropTable('flowStage');
  }
};
