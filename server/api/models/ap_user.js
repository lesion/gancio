
module.exports = (sequelize, DataTypes) =>
  sequelize.define('ap_user', {
  ap_id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  follower: DataTypes.BOOLEAN,
  blocked: DataTypes.BOOLEAN,
  object: DataTypes.JSON
})
