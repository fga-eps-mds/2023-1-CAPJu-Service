import { Model, DataTypes } from "sequelize";

class Note extends Model {
  static init(sequelize) {
    super.init(
      {
        idNote: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        commentary: DataTypes.STRING(100),
        record: {
          type: DataTypes.STRING(20),
          foreignKey: true,
          allowNull: false,
        },
        idStageA: {
          type: DataTypes.INTEGER,
          allownull: false,
        },
        idStageB: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "note",
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Process, { foreignKey: "record", as: "process" });
  }
}

export default Note;
