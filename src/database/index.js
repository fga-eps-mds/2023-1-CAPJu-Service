
import Sequelize from 'sequelize';
import config from '../../config/database.js';
// const config = require('../../config/database.js');
import Unit from '../models/Unit.js';

// const models = [Unit];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(config);

    Unit.init(this.connection);

    Unit.associate(this.connection.models);
  }
}

export default new Database();