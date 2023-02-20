const cache = require('memory-cache')
const providerCache = new cache.Cache()

const photon = {
  commonName: 'Photon',
  DEFAULT_ENDPOINT: 'https://photon.komoot.io/api/',
  endpoint: (req, res) => {
    return res.locals.settings.geocoding_provider || photon.DEFAULT_ENDPOINT
  },
  cache: providerCache,

  getParams (req, res) {
    const details = req.params.place_details

    return {
      q: details,
      limit: 3,
    }
  },

  /**
   * Icons to nominatim `osm_type` and `class` conversion
   */
  searchIcons_nominatim_osm_type: {
    'W': 'mdiRoadVariant',
    'N': 'mdiMapMarker',
    'R': 'mdiCityVariant',
  },
  searchIcons_nominatim_class: ['amenity', 'shop', 'tourism', 'leisure', 'building'],

  loadResultIcon (item) {
    if (this.searchIcons_nominatim_class.includes(item.class)) {
      return 'mdiHome'
    }
    return this.searchIcons_nominatim_osm_type[item.type]
  },

  /**
   * Map results from provider
   */
  fullAddressMapping: ['housenumber', 'street', 'locality', 'district', 'city', 'county', 'state', 'postcode', 'country'],

  mapQueryResults(ret, addressList = []) {
    if (ret) {
      addressList = ret.features.map(v => {
        let pre_name = v.properties.name || v.properties.street || ''
        let pre_address = ''

        this.fullAddressMapping.forEach((item, i) => {
          let last = i == (this.fullAddressMapping.length - 1)
          if (v.properties[item] && !last) {
            pre_address += v.properties[item]+', '
          } else if (v.properties[item]) {
            pre_address += v.properties[item]
          }
        });

        let name = pre_name
        let address = pre_address
        return {
          class: v.properties.osm_key,
          type: v.properties.osm_type,
          lat: v.geometry.coordinates[1],
          lon: v.geometry.coordinates[0],
          name,
          address
        }
      })
    }
    return addressList 
  }

}

module.exports = photon