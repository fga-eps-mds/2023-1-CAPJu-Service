import Sequelize, { Model , DataTypes } from 'sequelize';

class Unit extends Model {
    static init(sequelize) {
        super.init({
            name: DataTypes.STRING
        }, {
            sequelize
        })
    }

    static associate(models) {
        this.hasMany(models.User, {
            foreignKey: 'cpf',
            as: 'users'
        })
    
    }
}


  


export default Unit;