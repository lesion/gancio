const nominatim = require('../../../server/services/geocoding/nominatim')
const photon = require('../../../server/services/geocoding/photon')

const geocodingProviders = [ nominatim, photon ]

const geolocation = {
  getGeocodingProvider(providerName) {
    let geocodingProvider
    geocodingProviders.forEach((item) => {
      if (item.commonName === providerName) {
        geocodingProvider = item
      }
    })
    return geocodingProvider
  }
}

module.exports = geolocation