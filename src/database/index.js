
import Sequelize from 'sequelize';
import config from '../../config/database.js';
// const config = require('../../config/database.js');
import Flow from '../models/Flow.js';
import FlowProcess from '../models/FlowProcess.js';
import FlowStage from '../models/FlowStage.js';
import Priority from '../models/Priority.js';
import Process from '../models/Process.js';
import Role from '../models/Role.js';
import Stage from '../models/Stage.js';
import Unit from '../models/Unit.js';
import User from '../models/User.js';

// const models = [Unit, Role];
const models = [
  Flow,
  FlowProcess,
  FlowStage,
  Priority,
  Process,
  Role,
  Stage,
  Unit,
  User
];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(config);

    Flow.init(this.connection);
    FlowProcess.init(this.connection);
    FlowStage.init(this.connection);
    Priority.init(this.connection);
    Process.init(this.connection);
    Role.init(this.connection);
    Stage.init(this.connection);
    Unit.init(this.connection);
    User.init(this.connection);

    Flow.associate(this.connection.models);
    FlowProcess.associate(this.connection.models);
    FlowStage.associate(this.connection.models);
    Priority.associate(this.connection.models);
    Process.associate(this.connection.models);
    Role.associate(this.connection.models);
    Stage.associate(this.connection.models);
    Unit.associate(this.connection.models);
    User.associate(this.connection.models);
  }
}

export default new Database();
