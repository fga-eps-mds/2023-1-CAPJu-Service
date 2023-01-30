'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('priority', [
      {
        idPriority: 0,
        description: 'Sem prioridade',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        idPriority: 1,
        description: 'Art. 1048, II. Do CPC (ECA)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        idPriority: 2,
        description: 'Art. 1048, IV do CPC (Licitação)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        idPriority: 3,
        description: 'Art. 7, parágrafo 4, da Lei n 12.016/2009',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        idPriority: 4,
        description: 'Idosa(a) maior de 80 anos',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        idPriority: 5,
        description: 'Pessoa com deficiencia',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        idPriority: 6,
        description: 'Pessoa em situação de rua',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        idPriority: 7,
        description: 'Portador(a) de doença grave',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        idPriority: 8,
        description: 'Réu Preso',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('priority', null, {});
  }
};
