const { Op } = require('sequelize')
const config = require('../../config')
const User = require('./models/user')

const Auth = {
  async fillUser(req, res, next) {
    if (!req.user) return next()
    req.user = await User.findOne({
      where: { id: { [Op.eq]: req.user.id }, is_active: true }
    })
    next()
  },
  async isAuth(req, res, next) {
    console.error('ma sono dentro auth ?!?!', req.user)
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
    if (req.user.is_admin && req.user.is_active) return next()
    return res.status(403).send({ message: 'Admin needed' })
  }
}

module.exports = Auth
