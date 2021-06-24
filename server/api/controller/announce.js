const Announcement = require('../models/announcement')
const log = require('../../log')

const announceController = {
  async getAll (req, res) {
    const announces = await Announcement.findAll({ raw: true })
    return res.json(announces)
  },

  _getVisible () {
    return Announcement.findAll({ where: { visible: true }, raw: true })
  },

  async add (req, res) {
    const announcementDetail = {
      title: req.body.title,
      announcement: req.body.announcement,
      visible: true
    }
    log.info('Create announcement: "%s" ', req.body.title)
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
      log.error('Toggle announcement failed: %s ', e)
      res.sendStatus(404)
    }
  },

  async remove (req, res) {
    log.info('Remove announcement "%d"', req.params.announce_id)
    const announce_id = req.params.announce_id
    try {
      const announce = await Announcement.findByPk(announce_id)
      await announce.destroy()
      res.sendStatus(200)
    } catch (e) {
      log.error('Remove announcement failed: "%s" ', e)
      res.sendStatus(404)
    }
  }

}

module.exports = announceController
