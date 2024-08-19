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
    isActor: { // not used yet
      type: DataTypes.BOOLEAN
    },
    isTop: { // is this collection shown in top navbar in home page?
      type: DataTypes.BOOLEAN
    },
    sortIndex: {
      type: DataTypes.INTEGER,
    }
  }, { timestamps: false })
