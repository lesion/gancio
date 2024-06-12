module.exports = (sequelize, DataTypes) => 
  sequelize.define('task', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ['new', 'sent', 'error', 'sending'],
      defaultValue: 'new',
      index: true
    },
    error: {
      type: DataTypes.TEXT
    }
})