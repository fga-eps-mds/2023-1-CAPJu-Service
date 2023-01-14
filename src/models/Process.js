import { Model, DataTypes } from 'sequelize';

class Process extends Model {
  static init(sequelize) {
    super.init (
      {
        record: {
          type: DataTypes.STRING(20),
          primaryKey: true,
          allowNull: false,
        },
        nickname: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        effectiveDate: {
          type: DataTypes.DATE,
          allowNull: false
        },
        idUnit: {
          type: DataTypes.INTEGER,
          allowNull: false,
          foreignKey: true,
        },
        idStage: {
          type: DataTypes.INTEGER,
          foreignKey: true,
        },
        idPriority: {
          type: DataTypes.INTEGER,
          allowNull: false,
          foreignKey: true,
        }
      },
      {
        sequelize,
        tableName: 'process'
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Unit, { foreignKey: 'idUnit' , as: 'processUnit'});
    this.belongsTo(models.Priority, { foreignKey: 'idPriority', as: 'processPriority' });
    this.belongsTo(models.Stage, { foreignKey: 'idStage', as: 'processStage' });
    this.belongsToMany(models.Flow, { foreignKey: 'record', through: 'idFlowProcess', as: 'process' });
  }
}

export default Process;
