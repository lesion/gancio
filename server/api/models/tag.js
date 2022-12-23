module.exports = (sequelize, DataTypes) => 
  sequelize.define('tag', {
  tag: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true,
    primaryKey: true
  }
})