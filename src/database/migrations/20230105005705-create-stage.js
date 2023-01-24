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
    await queryInterface.sequelize.query(
      "ALTER TABLE stage \
      ADD CONSTRAINT \"stage_name_idUnit_uk\" \
      UNIQUE(\"idUnit\", name)",
      { type: Sequelize.QueryTypes.RAW }
    );
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.dropTable('stage');
  }
};
