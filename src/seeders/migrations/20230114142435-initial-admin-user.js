'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert(
       'users',
       [
         {
           cpf: '03472718129',
           fullName: 'Usuário Administrador Inicial',
           email: 'email@email.com',
           password: 'admin-admin',
           idUnit: 1,
           idRole: 5,
           createdAt: new Date(),
           updatedAt: new Date()
         }
       ], {});
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('users', null, {});
  }
};
