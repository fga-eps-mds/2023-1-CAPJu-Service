import { Sequelize } from "sequelize";
import { Umzug, SequelizeStorage } from "umzug";

import Flow from "../models/Flow.js";
import FlowProcess from "../models/FlowProcess.js";
import FlowStage from "../models/FlowStage.js";
import Priority from "../models/Priority.js";
import Process from "../models/Process.js";
import Role from "../models/Role.js";
import Stage from "../models/Stage.js";
import Unit from "../models/Unit.js";
import User from "../models/User.js";
import FlowUser from "../models/FlowUser.js";

class Database {
  models = [
    Flow,
    FlowProcess,
    FlowStage,
    Priority,
    Process,
    Role,
    Stage,
    Unit,
    User,
    FlowUser,
  ];

  connection;

  constructor() {
    this.connection = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: null,
    });

    Flow.init(this.connection);
    FlowProcess.init(this.connection);
    FlowStage.init(this.connection);
    Priority.init(this.connection);
    Process.init(this.connection);
    Role.init(this.connection);
    Stage.init(this.connection);
    Unit.init(this.connection);
    User.init(this.connection);
    FlowUser.init(this.connection);

    Flow.associate(this.connection.models);
    FlowProcess.associate(this.connection.models);
    FlowStage.associate(this.connection.models);
    Priority.associate(this.connection.models);
    Process.associate(this.connection.models);
    Role.associate(this.connection.models);
    Stage.associate(this.connection.models);
    Unit.associate(this.connection.models);
    User.associate(this.connection.models);
    FlowUser.associate(this.connection.models);
  }

  async checkConnection() {
    await this.connection.authenticate();
  }

  async migrate() {
    await this.checkConnection();
    const sequelize = this.connection;
    const queryInterface = sequelize.getQueryInterface();
    const sequelizeStorage = new SequelizeStorage({ sequelize });
    /*const umzug = new Umzug({
      migrations: {
        glob: 'src/database/migrations/*.js',
        context: sequelize.getQueryInterface(),
        storage: new SequelizeStorage({ sequelize: this.connection }),
        logger: console,
        resolve: ({ name, path }) => ({
          const migration = require(path);
          //console.log('name', name, 'path', path, 'context', context, 'migration', migration);
          console.log('name', name, 'path', path, 'migration', migration);

          //await migration.up(queryInterface, Sequelize)
          return {
            name,
            up: async () => migration.up(queryInterface, Sequelize),
            down: async () => migration.down(queryInterface, Sequelize)
          };
        })
      }
    });*/

    const umzug = new Umzug({
      migrations: {
        glob: "src/database/migrations/*.js",
        resolve: ({ name, path, context }) => {
          const migration = require(path);
          return {
            name,
            up: async () => migration.up(context, Sequelize),
            down: async () => migration.down(context, Sequelize),
          };
        },
      },
      context: queryInterface,
      storage: sequelizeStorage,
      logger: null,
    });

    // console.log('Sequelize', Sequelize);
    //console.log('umzugM', umzug);

    //console.log('cwdM', process.cwd());

    //console.log('pendingM', await umzug.pending());

    const migrations = await umzug.up();
    //console.log('migrations', migrations);
  }

  async seed() {
    await this.checkConnection();
    const sequelize = this.connection;
    const queryInterface = sequelize.getQueryInterface();
    const sequelizeStorage = new SequelizeStorage({ sequelize });
    /*const umzug = new Umzug({
      migrations: {
        glob: 'src/seeders/migrations/*.js',
        context: this.connection.getQueryInterface(),
        storage: new SequelizeStorage({ sequelize: this.connection }),
        logger: console,
        resolve: ({ name, path, context }) => {
          const migration = require(path);
          return {
            name,
            up: async () => migration.up(context, Sequelize),
            down: async () => migration.down(context, Sequelize)
          };
        }
      }
    });*/
    const umzug = new Umzug({
      migrations: {
        glob: "src/seeders/migrations/*.js",
        resolve: ({ name, path, context }) => {
          const migration = require(path);
          return {
            name,
            up: async () => migration.up(context, Sequelize),
            down: async () => migration.down(context, Sequelize),
          };
        },
      },
      context: queryInterface,
      storage: sequelizeStorage,
      logger: null,
    });
    //console.log('umzugS', umzug);

    //console.log('cwdS', process.cwd());

    //console.log('pendingS', await umzug.pending());

    const seeds = await umzug.up();
    //console.log('seeds', seeds);
  }
}

export { Database };
