const cache = require('memory-cache')
const providerCache = new cache.Cache()
const get = require('lodash/get')

const nominatim = {
  commonName: 'Nominatim',
  DEFAULT_ENDPOINT: 'https://nominatim.openstreetmap.org/search',
  endpoint: (req, res) => { 
    return res.locals.settings.geocoding_provider || nominatim.DEFAULT_ENDPOINT
  },
  cache: providerCache,

  getParams (req, res) {
    const countrycodes = res.locals.settings.geocoding_countrycodes || []
    const details = req.params.place_details

    return {
      countrycodes: countrycodes.join(','),
      q: details,
      limit: 3,
      format: 'json',
      addressdetails: 1,
      namedetails: 1,
    }
  },

  /*
   * Icons to nominatim `osm_type` and `class` conversion
   */
  searchIcons_nominatim_osm_type: {
    way: 'mdiRoadVariant',
    house: 'mdiHome',
    node: 'mdiMapMarker',
    relation: 'mdiCityVariant',
  },
  searchIcons_nominatim_class: {
    mdiHome: ['place', 'amenity', 'shop', 'tourism', 'leisure', 'building']
  },

  filterNameFromAddress: ['place', 'amenity', 'shop', 'tourism', 'leisure', 'building'],

  mapQueryResults (ret, addressList = []) {
    if (ret && ret.length) {
      addressList = ret.map(v => {
        const name = get(v.namedetails, 'alt_name', get(v.namedetails, 'name'))
        const address = this.filterNameFromAddress.includes(v.class) ? v.display_name.replace(name, '').replace(/^, ?/, '') : v.display_name.replace(/^, ?/, '')
        return {
          class: v.class,
          type: v.osm_type,
          lat: v.lat,
          lon: v.lon,
          name,
          address
        }
      }) 
    }
    return addressList
  }

}

module.exports = nominatim