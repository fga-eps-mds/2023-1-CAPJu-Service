'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('flowProcess', { 
      idFlowProcess: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      idFlow: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'flow', key: 'idFlow' },
        onDelete: 'RESTRICT'
      },
      record: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: 'process', key: 'record' },
        onDelete: 'RESTRICT'
      },
      finalised: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
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
