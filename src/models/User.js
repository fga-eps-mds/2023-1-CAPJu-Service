import { Model , DataTypes } from 'sequelize';
// import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        fullName: DataTypes.STRING(300),
        email: DataTypes.STRING(300),
        password: DataTypes.STRING(256),
       
      },
      {
        sequelize,
        tableName: 'user'
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Unit, { foreignKey: 'idUnit', as: 'unit' });
    this.hasOne(models.Role, { foreignKey: 'idRole', as: 'role' });
  }

}

export default User;