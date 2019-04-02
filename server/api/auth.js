const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const config = require('./config')
const User = require('./models/user')

const Auth = {
  fillUser(req, res, next) {
    const token =
      req.body.token || req.params.token || req.headers['x-access-token']
    if (!token) return next()
    jwt.verify(token, config.secret, async (err, decoded) => {
      if (err) return next()
      req.user = await User.findOne({
        where: { email: { [Op.eq]: decoded.email }, is_active: true }
      })
      next()
    })
  },
  isAuth(req, res, next) {
    const token =
      (req.body && req.body.token) ||
      req.params.token ||
      req.headers['x-access-token']
    if (!token) return res.status(403).send({ message: 'Token not found' })
    jwt.verify(token, config.secret, async (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .send({ message: 'Failed to authenticate token ' + err })
      }
      req.user = await User.findOne({
        where: { email: { [Op.eq]: decoded.email }, is_active: true }
      })
      if (!req.user) {
        return res
          .status(403)
          .send({ message: 'Failed to authenticate token ' + err })
      }
      next()
    })
  },
  isAdmin(req, res, next) {
    if (req.user.is_admin && req.user.is_active) return next()
    return res.status(403).send({ message: 'Admin needed' })
  }
}

module.exports = Auth
