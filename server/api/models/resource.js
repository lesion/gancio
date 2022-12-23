module.exports = (sequelize, DataTypes) => 
  sequelize.define('resource', {
  activitypub_id: {
    type: DataTypes.STRING,
    index: true,
    unique: true
  },
  hidden: DataTypes.BOOLEAN,
  data: DataTypes.JSON
})