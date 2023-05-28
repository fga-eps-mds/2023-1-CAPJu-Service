'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('flowProcess', 'status', {
      type: Sequelize.ENUM({ 
        values: ['Aguardando inicio','Em Andamento','Finalizado','Arquivado']
      }),
      allowNull: false,
  });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('flowProcess', 'status');
  }
};
