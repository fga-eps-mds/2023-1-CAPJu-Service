import { Model , DataTypes } from 'sequelize';

class Role extends Model {
    static init(sequelize) {
        super.init({
            idRole: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: DataTypes.STRING,
            accessLevel: DataTypes.SMALLINT,
        }, {
            sequelize,
            tableName: 'role'
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