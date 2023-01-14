'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert(
       'role',
       [
         {
          name: 'Estagiário',
          accessLevel: 1,
          createdAt: new Date(),
          updatedAt: new Date()
         },
         {
           name: 'Servidor',
           accessLevel: 2,
          createdAt: new Date(),
          updatedAt: new Date()
         },
         {
           name: 'Juiz',
           accessLevel: 3,
          createdAt: new Date(),
          updatedAt: new Date()
         },{
           name: 'Diretor',
           accessLevel: 4,
          createdAt: new Date(),
          updatedAt: new Date()
         },
         {
           name: 'Administrador',
           accessLevel: 5,
          createdAt: new Date(),
          updatedAt: new Date()
         }
       ], {});
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('role', null, {});
  }
};
