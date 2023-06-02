'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint('users', {
      fields: ['email'],
      type: 'unique',
      name: 'users_email_unique_constraint',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('users', 'users_email_unique_constraint');
  }
};
