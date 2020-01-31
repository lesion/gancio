const { place: Place } = require('../models')
const debug = require('debug')('place')
const axios = require('axios')
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search.php?format=json&q='

const placeController = {
  async _nominatim (req, res) {
    const place_id = req.params.place_id
    const place = await Place.findByPk(place_id)
    if (!place) {
      return
    }
    const ret = await axios.get(`${NOMINATIM_URL}${place.address}`, { headers: { 'User-Agent': 'gancio 0.20' } })
    debug(`${NOMINATIM_URL}${place.address}`)
    debug(ret.status)
    debug(ret.statusText)
    debug(ret.data)
    return ret
  },

  _recurrentSearch () {

  }
}

module.exports = placeController
