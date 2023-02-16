const isoCountries = require('./isoCountries')
const nominatim = require('../../../server/services/geocoding/nominatim')
const photon = require('../../../server/services/geocoding/photon')

// const geocodingProviders = [ nominatim, photon ]

// const geolocation = {
//   getGeocodingProvider(providerName) {
//     geocodingProviders.forEach((item) => {
//       if (item.commonName === settings.geocoding_provider_type) {
//         return item
//       }
//     })
//   }
// }

// module.exports = geolocation