import { Model, DataTypes } from "sequelize";
// import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        cpf: {
          type: DataTypes.STRING(11),
          primaryKey: true,
        },
        fullName: {
          type: DataTypes.STRING(300),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(300),
          allowNull: false,
        },
        password: {
          type: DataTypes.STRING(256),
          allowNull: false,
        },
        accepted: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        idUnit: {
          type: DataTypes.INTEGER,
          foreignKey: true,
          allowNull: false,
        },
        idRole: {
          type: DataTypes.INTEGER,
          foreignKey: true,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "users",
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Unit, { foreignKey: "idUnit", as: "unit" });
    this.belongsTo(models.Role, { foreignKey: "idRole", as: "role" });
    this.belongsToMany(models.Flow, {
      foreignKey: "cpf",
      through: "idFlowUser",
      as: "flow",
    });
  }
}

export default User;
