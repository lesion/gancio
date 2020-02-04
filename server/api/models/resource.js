module.exports = (sequelize, DataTypes) => {
  const Resource = sequelize.define('resource', {
    activitypub_id: {
      type: DataTypes.STRING,
      index: true,
      unique: true
    },
    hidden: DataTypes.BOOLEAN,
    data: DataTypes.JSON
  }, {})

  Resource.associate = function (models) {
    // Resource.belongsTo(models.instance)
    Resource.belongsTo(models.event)
    Resource.belongsTo(models.ap_user)
  }

  return Resource
}
