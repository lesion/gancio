module.exports = (sequelize, DataTypes) => 
  sequelize.define('announcement', {
    title: DataTypes.STRING,
    announcement: DataTypes.STRING,
    visible: DataTypes.BOOLEAN
  })
