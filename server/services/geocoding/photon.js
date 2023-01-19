
module.exports = {
  commonName: 'Photon',
  DEFAULT_ENDPOINT: 'https://photon.komoot.io/api/',
  endpoint: (req, res) => {
    return res.locals.settings.geocoding_provider || this.DEFAULT_ENDPOINT
  },

  getParams (req, res) {
    const details = req.params.place_details

    return {
      q: details,
      limit: 3,
    }
  }

}