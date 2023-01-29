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
    if (queryInterface.sequelize.getDialect() === 'sqlite') {
      /* SQLite does not support the ADD CONSTRAINT variant of the ALTER TABLE
       * SQL-92 command. Fortunately, unique constraints are implemented in
       * SQLite using unique indexes, so a constraint can be added using the
       * creation of an index.
       * See:
       * https://www.sqlite.org/omitted.html
       * https://www.sqlite.org/lang_altertable.html
       * https://www.sqlite.org/lang_createtable.html
       */
      await queryInterface.sequelize.query(
        "CREATE UNIQUE INDEX stage_name_idUnit_uk \
        ON stage(idUnit, name)",
        { type: Sequelize.QueryTypes.RAW }
      );
    } else {
      /* Assuming dialect = postgres */
      await queryInterface.sequelize.query(
        "ALTER TABLE stage \
        ADD CONSTRAINT \"stage_name_idUnit_uk\" \
        UNIQUE(\"idUnit\", name)",
        { type: Sequelize.QueryTypes.RAW }
      );
    }
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.dropTable('stage');
  }
};
