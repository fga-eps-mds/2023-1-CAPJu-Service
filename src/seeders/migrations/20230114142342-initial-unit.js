'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert(
       'unit',
       [
         {
           name: 'FGA',
           createdAt: new Date(),
           updatedAt: new Date()
         }
       ], {});
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('unit', null, {});
  }
};
