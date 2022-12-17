import Sequelize, { Model } from 'sequelize';

class Role extends Model {
  static init(sequelize) {
    super.init(
      {
        idRole: Sequelize.INTEGER,
        name: Sequelize.STRING(30),
        accessLevel: Sequelize.SMALLINT,
      },
      {
        sequelize,
      }
    );

    return this;
  }

}

export default Role;