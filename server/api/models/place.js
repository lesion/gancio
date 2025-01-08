const config = require('../../config')

module.exports = (sequelize, DataTypes) => {
  const Place = sequelize.define('place', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      index: true,
      allowNull: false
    },
    ap_id: {
      type: DataTypes.STRING,
      index: true
    },
    address: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
  })

  /**
   * @description WIP -> https://codeberg.org/fediverse/fep/src/commit/4a75a1bc50bc6d19fc1e6112f02c52621bc178fe/fep/8a8e/fep-8a8e.md#location
   * @todo support PlaceAddress type
   * @returns ActivityStream location representation
   */
  Place.prototype.toAP = function () {
    return {
      id: this?.ap_id ?? `${config.baseurl}/federation/p/${this.id}`,
      type: 'Place',
      name: this.name,
      address: this.address,
      latitude: this.latitude,
      longitude: this.longitude
    }
  }

  return Place
}
