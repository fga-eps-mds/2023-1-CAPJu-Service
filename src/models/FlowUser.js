import { Model , DataTypes } from 'sequelize';

class FlowUser extends Model {
	static init(sequelize) {
		super.init(
			{
				idFlowUser: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true
				},
				cpf: {
					type: DataTypes.STRING(11),
					foreignKey: true
				},
				idFlow: {
					type: DataTypes.INTEGER,
					foreignKey: true
				}
			},
			{
				sequelize,
				tableName: 'flowUser'
			}
		);

		return this;
	}

	static associate(models) {
		this.belongsToMany(models.User, {
			foreignKey: 'cpf',
			through: 'idFlowUser',
			as: 'user'
		});
		this.belongsToMany(models.Flow, {
			foreignKey: 'idFlow',
			through: 'idFlowuser',
			as: 'flow'
		});
	}
}

export default FlowUser;
