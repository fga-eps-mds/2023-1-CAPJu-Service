import { Model , DataTypes } from 'sequelize';

class FlowProcess extends Model {
  static init(sequelize) {
    super.init(
      {
        idFlowProcess: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        idFlow: {
          type: DataTypes.INTEGER,
          allowNull: false,
          foreignKey: true,
        },
        record: {
          type: DataTypes.STRING(20),
          allowNull: false,
          foreignKey: true,
        },
        finalised: {
          type: DataTypes.BOOLEAN,
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
