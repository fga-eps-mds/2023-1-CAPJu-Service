import { Model, DataTypes } from 'sequelize';

class Process extends Model {
  static init(sequelize) {
    super.init (
      {
        record: {
          type: Sequelize.STRING(20),
          primaryKey: true,
          allowNull: false,
        },
        nickname: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        effectiveDate: {
          type: Sequelize.DATE,
          allowNull: false
        },
        idUnit: {
          type: Sequelize.INTEGER,
          allowNull: false,
          foreignKey: true,
        },
        idStage: {
          type: Sequelize.INTEGER,
          foreignKey: true,
        },
        idPriority: {
          type: Sequelize.INTEGER,
          allowNull: false,
          foreignKey: true,
        }
      },
      {
        sequelize,
        tableName: 'processes'
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
