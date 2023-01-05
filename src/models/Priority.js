import { Model , DataTypes } from 'sequelize';

class Priority extends Model {
  static init(sequelize) {
    super.init(
      {
        idPriority: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        description: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'priorities'
      }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.Process, { foreignKey: 'record', as: 'process' });
  }
}

export default Unit;
