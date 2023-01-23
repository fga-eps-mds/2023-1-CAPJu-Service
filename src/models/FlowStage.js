import { Model , DataTypes } from 'sequelize';

class FlowStage extends Model {
  static init(sequelize) {
    super.init(
      {
        idFlowStage: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idStageA: {
          type: DataTypes.INTEGER,
          foreignKey: true,
        },
        idStageB: {
          type: DataTypes.INTEGER,
          foreignKey: true,
        },
        idFlow: {
            type: DataTypes.INTEGER,
            foreignKey: true,
        },
        commentary: {
            type: DataTypes.STRING(100)
        }
      },
      {
        sequelize,
        tableName: 'flowStage'
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Flow, { foreignKey: 'idFlow', through: 'idFlowStage', as: 'flow' });
    this.belongsToMany(models.Stage, { foreignKey: 'idStageA', through: 'idFlowStage', as: 'stageA' });
    this.belongsToMany(models.Stage, { foreignKey: 'idStageB', through: 'idFlowStage', as: 'stageB' });
  }

}

export default FlowStage;
