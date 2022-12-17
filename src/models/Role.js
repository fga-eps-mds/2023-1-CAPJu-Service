import { Model , DataTypes } from 'sequelize';

class Role extends Model {
    static init(sequelize) {
        super.init({
            name: DataTypes.STRING,
            accessLevel: DataTypes.SMALLINT,
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


  


export default Role;