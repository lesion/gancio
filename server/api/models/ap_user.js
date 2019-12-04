module.exports = (sequelize, DataTypes) => {
  const APUser = sequelize.define('ap_user', {
    ap_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    follower: DataTypes.BOOLEAN,
    blocked: DataTypes.BOOLEAN,
    object: DataTypes.JSON
  })

  APUser.associate = function (models) {
    APUser.belongsTo(models.instance)
    APUser.hasMany(models.resource)
  }

  return APUser
}