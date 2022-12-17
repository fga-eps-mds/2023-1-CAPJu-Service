
import Sequelize from 'sequelize';
import config from '../../config/database.js';
// const config = require('../../config/database.js');
import Unit from '../models/Unit.js';
import Role from '../models/Role.js';
import User from '../models/User.js'

const models = [Unit, Role];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(config);

    Unit.init(this.connection);
    Role.init(this.connection);
    User.init(this.connection);

    Unit.associate(this.connection.models);
    Role.associate(this.connection.models);
    User.associate(this.connection.models);
  }
}

export default new Database();