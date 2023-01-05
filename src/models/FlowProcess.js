import { Model , DataTypes } from 'sequelize';
import { Flow } from './Flow';
import { Process } from './Process';

class FlowProcess extends Model {
  static init(sequelize) {
    super.init(
      {
        idFlowProcess: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        idFlow: {
          type: Sequelize.INTEGER,
          allowNull: false,
          foreignKey: true,
        },
        record: {
          type: Sequelize.STRING(20),
          allowNull: false,
          foreignKey: true,
        },
        finalised: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        }
      },
      {
        sequelize,
        tableName: 'flowProcess'
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Flow, { foreignKey: 'idFlow', through: 'idFlowStage', as: 'flow' });
    this.belongsToMany(models.Process, { foreignKey: 'record', through: 'idFlowStage', as: 'process' });
  }

}

export default FlowProcess;
