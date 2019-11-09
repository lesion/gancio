module.exports = (sequelize, DataTypes) => {
  const fed_users = sequelize.define('fed_users', {
    ap_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    object: DataTypes.JSON
  }, {})
  fed_users.associate = function (models) {
    fed_users.belongsTo(models.instances)
    fed_users.belongsToMany(models.user, { through: 'user_followers', as: 'followers' })

  }
  return fed_users
}
