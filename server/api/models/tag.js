
module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('tag', {
    tag: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true,
      primaryKey: true
    },
    weigth: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false }
  }, {})

  Tag.associate = function (models) {
    Tag.belongsToMany(models.event, { through: 'event_tags' })
  }

  return Tag
}
