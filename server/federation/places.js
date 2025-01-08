const { Place } = require('../api/models/models')
const log = require('../log')

module.exports = {
  async get (req, res) {
    log.debug('[FEDI] Get location')
    const id = req.params.id
    if (!id) { return res.status(400).send('Bad request.') }

    const place = await Place.findByPk(id)
    if (!place) {
      log.warn(`[FEDI] Place ${id} not found`)
      return res.status(404).send('Not found.')
    }

    const ret = place.toAP()
    ret['@context'] = ['https://www.w3.org/ns/activitystreams']
    res.type('application/activity+json; charset=utf-8')
    res.json(ret)
  },
}
