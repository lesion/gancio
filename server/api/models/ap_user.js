
module.exports = (sequelize, DataTypes) =>
  sequelize.define('ap_user', {
  ap_id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  follower: DataTypes.BOOLEAN,
  following: DataTypes.BOOLEAN,
  friendly: DataTypes.BOOLEAN,
  blocked: DataTypes.BOOLEAN,
  object: {
    type: DataTypes.JSON,
  }
})
