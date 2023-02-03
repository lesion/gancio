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
  }

}

module.exports = photon