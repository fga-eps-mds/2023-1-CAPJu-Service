import { Model , DataTypes } from 'sequelize';
// import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        cpf: {
          type: DataTypes.STRING(11),
          primaryKey: true,
        },
        fullName: DataTypes.STRING(300),
        email: DataTypes.STRING(300),
        password: DataTypes.STRING(256),
          accepted: DataTypes.BOOLEAN,
        idUnit: {
          type: DataTypes.INTEGER,
          foreignKey: true,
        },
        idRole: {
          type: DataTypes.INTEGER,
          foreignKey: true,
        }
      },
      {
        sequelize,
        tableName: 'users'
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Unit, { foreignKey: 'idUnit', as: 'unit' });
    this.belongsTo(models.Role, { foreignKey: 'idRole', as: 'role' });
    this.belongsToMany(models.Flow, { foreignKey: 'cpf', through: 'idFlowUser', as: 'flow' });
  }

}

export default User;
