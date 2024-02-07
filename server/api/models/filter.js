module.exports = (sequelize, DataTypes) => 
  sequelize.define('filter', 
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tags: {
      type: DataTypes.JSON,
    },
    places: {
      type: DataTypes.JSON,
    },
    actors: {
      type: DataTypes.JSON
    }
  }, {
    indexes: [
      { fields: ['collectionId', 'tags', 'places', 'actors'], unique: true }
    ],
    timestamps: false
  })