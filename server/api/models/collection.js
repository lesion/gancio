module.exports = (sequelize, DataTypes) => 
  sequelize.define('collection', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      index: true,
      allowNull: false
    },
    isActor: {
      type: DataTypes.BOOLEAN
    },
    isTop: { // is this collection shown in top navbar in home page?
      type: DataTypes.BOOLEAN
    }
  }, { timestamps: false })
