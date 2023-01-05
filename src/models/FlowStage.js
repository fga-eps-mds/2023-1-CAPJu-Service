import { Model , DataTypes } from 'sequelize';
import { Flow } from './Flow';
import { Stage } from './Stage';

class FlowStage extends Model {
  static init(sequelize) {
    super.init(
      {
        idFlowStage: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idStage: {
          type: DataTypes.INTEGER,
          foreignKey: true,
        },
        idFlow: {
            type: DataTypes.INTEGER,
            foreignKey: true,
          },
      },
      {
        sequelize,
        tableName: 'flowStage'
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Flow, { foreignKey: 'idStage', through: 'idFlowStage', as: 'flow' });
    this.belongsToMany(models.Stage, { foreignKey: 'idFlow', through: 'idFlowStage', as: 'stage' });
  }

}

export default FlowStage;
