import {DataTypes} from 'sequelize'

export default sequelize => {
  return sequelize.define('User', {
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'users'
  });
};
