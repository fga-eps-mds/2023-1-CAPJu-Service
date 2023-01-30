import { Model , DataTypes } from 'sequelize';

class Stage extends Model {
  static init(sequelize) {
    super.init(
      {
        idStage: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allownull: false
        },
        name: DataTypes.STRING(100),
        duration: {
          type: DataTypes.SMALLINT,
          allowNull: false
        },
        idUnit: {
          type: DataTypes.INTEGER,
          foreignKey: true,
          allowNull: false
        },
      },
      {
        sequelize,
        tableName: 'stage'
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Unit, { foreignKey: 'idUnit', as: 'unit' });
    this.belongsToMany(models.Flow, { foreignKey: 'idStage', through: 'idFlowStage', as: 'flow' });
    this.hasMany(models.Process, { foreignKey: 'record', as: 'process' });
  }

}

export default Stage;
