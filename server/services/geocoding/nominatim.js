const cache = require('memory-cache')
const providerCache = new cache.Cache()

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

}

module.exports = nominatim