const { Op } = require('sequelize')
const { user: User } = require('./models')

const Auth = {

  /** isAuth middleware
   * req.user is filled in server/helper.js#initMiddleware
  */
  async isAuth (req, res, next) {
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
        .send({ message: 'Failed to authenticate token ' })
    }
    next()
  },

  /** isAdmin middleware */
  isAdmin (req, res, next) {
    if (!req.user) {
      return res
        .status(403)
        .send({ message: 'Failed to authenticate token ' })
    }
    if (req.user.is_admin && req.user.is_active) { return next() }
    return res.status(403).send({ message: 'Admin needed' })
  }

}

module.exports = Auth
