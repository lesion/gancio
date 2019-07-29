const express = require('express')
const router = express.Router()
const { user: User } = require('../api/models')
const config = require('config')

router.get('/', async (req, res) => {
  console.error('ma sono dentro webfinger ?!?!')
  const resource = req.query.resource
  if (!resource || !resource.includes('acct:')) {
    return res.status(400).send('Bad request. Please make sure "acct:USER@DOMAIN" is what you are sending as the "resource" query parameter.')
  }
  const name = resource.match(/acct:(.*)@/)[1]
  const domain = new URL(config.baseurl).host
  const user = await User.findOne({where: { username: name } })
  if (!user) return res.status(404).send(`No record found for ${name}`)
  const ret = {
    subject: `acct:${name}@${domain}`,
    links: [
      {
        rel: 'self',
        type: 'application/activity+json',
        href: `${config.baseurl}/federation/u/${name}`
      }
    ]
  }
  res.json(ret)
})
module.exports = router
