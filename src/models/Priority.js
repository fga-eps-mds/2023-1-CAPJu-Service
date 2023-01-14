import { Model , DataTypes } from 'sequelize';

class Priority extends Model {
  static init(sequelize) {
    super.init(
      {
        idPriority: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'priority'
      }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.Process, { foreignKey: 'record', as: 'process' });
  }
}

export default Priority;
