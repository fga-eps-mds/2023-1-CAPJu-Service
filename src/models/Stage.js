import { Model , DataTypes } from 'sequelize';

class Stage extends Model {
  static init(sequelize) {
    super.init(
      {
        idStage: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: DataTypes.STRING(100),
        idUnit: {
          type: DataTypes.INTEGER,
          foreignKey: true,
        },
        iFlow: {
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
    this.belongsToMany(models.Flow, { foreignKey: 'idStage', through: 'idFlowStage', as: 'flow' })
  }

}

export default Stage;
