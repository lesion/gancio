const config = require('../../config')

module.exports = (sequelize, DataTypes) => {
  const Place = sequelize.define('place', {
    name: {
      type: DataTypes.STRING,
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
   * @returns ActivityStream location representation
   * @link https://www.w3.org/TR/activitystreams-vocabulary/#places
   * @todo support PostalAddress type
   * @link WIP -> https://codeberg.org/fediverse/fep/src/commit/4a75a1bc50bc6d19fc1e6112f02c52621bc178fe/fep/8a8e/fep-8a8e.md#location
   */
  Place.prototype.toAP = function () {
    return {
      id: this?.ap_id ?? `${config.baseurl}/federation/p/${this.id}`,
      type: 'Place',
      name: this.name,
      address: this.address,
      ...( this.latitude && this.longitude && ({ latitude: this.latitude, longitude: this.longitude}))
    }
  }

  return Place
}
