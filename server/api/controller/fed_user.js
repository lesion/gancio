const { fed_users: FedUsers, comment: Comment } = require('../models')

const fedUserController = {
  async toggleBlock (req, res) {
    const user_id = req.body.user_id
    const user = await FedUsers.findByPk(user_id)
    user.update({ blocked: !user.blocked })
    res.json(user)
  },

  async hideComment (req, res) {
    const comment_id = req.params.comment_id
    const hidden = req.body.hidden
    const comment = await Comment.findByPk(comment_id)
    await comment.update({ hidden })
    res.json(comment)
  },

  async removeComment (req, res) {
    const comment_id = req.params.comment_id
    const comment = await Comment.findByPk(comment_id)
    await comment.destroy()
    res.sendStatus(200)
  }
}

module.exports = fedUserController
