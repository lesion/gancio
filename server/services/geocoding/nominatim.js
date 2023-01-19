
module.exports = {
  commonName: 'Nominatim',
  DEFAULT_ENDPOINT: 'https://nominatim.openstreetmap.org/search',
  endpoint: (req, res) => { 
    return res.locals.settings.geocoding_provider || this.DEFAULT_ENDPOINT
  },

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