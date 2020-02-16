module.exports = (sequelize, DataTypes) => {
  const announcement = sequelize.define('announcement', {
    title: DataTypes.STRING,
    announcement: DataTypes.STRING,
    visible: DataTypes.BOOLEAN
  }, {})

  return announcement
}
