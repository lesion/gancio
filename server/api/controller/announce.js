const { Announcement } = require('../models/models')

const log = require('../../log')

const announceController = {
  async getAll (req, res) {
    const announces = await Announcement.findAll({ raw: true })
    return res.json(announces)
  },

  async get (req, res) {
    const announce_id = req.params.announce_id

    try {
      const announce = await Announcement.findByPk(announce_id)
      return res.json(announce)
    } catch (e) {
      log.error('Get announcement failed:', String(e))
      return res.sendStatus(404)      
    }
  },

  _getVisible () {
    return Announcement.findAll({ attributes: ['title', 'id'], where: { visible: true }, raw: true })
  },

  async add (req, res) {
    const announcementDetail = {
      title: req.body.title,
      announcement: req.body.announcement,
      visible: true
    }
    log.info('Create announcement: ' + req.body.title)
    const announce = await Announcement.create(announcementDetail)
    res.json(announce)
  },

  async update (req, res) {
    const announceDetails = {
      title: req.body.title,
      announcement: req.body.announcement,
      visible: req.body.visible
    }
    const announce_id = req.params.announce_id
    try {
      let announce = await Announcement.findByPk(announce_id)
      announce = await announce.update(announceDetails)
      res.json(announce)
    } catch (e) {
      log.error('Toggle announcement failed', e)
      res.sendStatus(404)
    }
  },

  async remove (req, res) {
    log.info('Remove announcement', req.params.announce_id)
    const announce_id = req.params.announce_id
    try {
      const announce = await Announcement.findByPk(announce_id)
      await announce.destroy()
      res.sendStatus(200)
    } catch (e) {
      log.error('Remove announcement failed:', e)
      res.sendStatus(404)
    }
  }

}

module.exports = announceController
