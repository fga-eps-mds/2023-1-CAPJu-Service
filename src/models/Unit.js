import { Model , DataTypes } from 'sequelize';

class Unit extends Model {
    static init(sequelize) {
        super.init({
            idUnit: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: DataTypes.STRING
        }, {
            sequelize,
            tableName: 'unit'
        })
    }

    static associate(models) {
        this.hasMany(models.User, {
            foreignKey: 'cpf',
            as: 'users'
        });
        this.hasMany(models.Flow, {
            foreignKey: 'idFlow',
            as: 'flow'
        });
        this.hasMany(models.Process, {
            foreignKey: 'record',
            as: 'procs'
        });
    }
}

export default Unit;
