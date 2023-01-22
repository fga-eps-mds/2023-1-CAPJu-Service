import { Model, DataTypes } from 'sequelize';

class Flow extends Model {
  static init(sequelize) {
    super.init(
      {
        idFlow: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: DataTypes.STRING(100),
        idUnit: {
          type: DataTypes.INTEGER,
          foreignKey: true,
        },
      },
      {
        sequelize,
        tableName: 'flow'
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Unit, { foreignKey: 'idUnit', as: 'unit' });
    this.belongsToMany(models.Stage, { foreignKey: 'idFlow', through: 'idFlowStage' , as: 'stage' });
    this.belongsToMany(models.Process, { foreignKey: 'idFlow', through: 'idFlowProcess', as: 'process' });
    this.belongsToMany(models.User, { foreignKey: 'idFlow', through: 'idFlowUser', as: 'user' });
  }
}

export default Flow;
