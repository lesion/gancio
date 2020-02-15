module.exports = (sequelize, DataTypes) => {
  const announcement = sequelize.define('announcement', {
    announce: DataTypes.STRING,
    until: DataTypes.DATE
  }, {})

  return announcement
}
