module.exports = (sequelize, DataTypes) => {
  const announcement = sequelize.define('announcement', {
    announce: DataTypes.STRING,
    until: DataTypes.DATE,
    visible: DataTypes.BOOLEAN
  }, {})

  return announcement
}
