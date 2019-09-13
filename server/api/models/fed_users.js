module.exports = (sequelize, DataTypes) => {
  const fed_users = sequelize.define('fed_users', {
    ap_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    object: DataTypes.JSON
  }, {})
  fed_users.associate = function(models) {
    // associations can be defined here
  };
  return fed_users
}