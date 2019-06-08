const { Op } = require('sequelize')
const { user: User } = require('./models')
const Settings = require('./controller/settings')

const Auth = {
  async fillUser(req, res, next) {
    if (!req.user) return next()
    req.user = await User.findOne({
      where: { id: { [Op.eq]: req.user.id }, is_active: true }
    }).catch(e => {
      res.sendStatus(404)
      return next(false)
    })
    next()
  },
  async isAuth(req, res, next) {
    if (!req.user) {
      return res
        .status(403)
        .send({ message: 'Failed to authenticate token ' })
    }
    
    req.user = await User.findOne({
      where: { id: { [Op.eq]: req.user.id }, is_active: true }
    })
    if (!req.user) {
      return res
        .status(403)
        .send({ message: 'Failed to authenticate token ' + err })
    }
    next()
  },
  isAdmin(req, res, next) {
    if (!req.user) {
      return res
        .status(403)
        .send({ message: 'Failed to authenticate token ' })
    }
    if (req.user.is_admin && req.user.is_active) return next()
    return res.status(403).send({ message: 'Admin needed' })
  },
  async adminOrFirstRun(req, res, next) {
    if (req.user && req.user.is_admin && req.user.is_active) return next()
    const settings = await Settings.settings()
    if (!settings.firstRun) {
      return next()
    }
  }

}

module.exports = Auth
