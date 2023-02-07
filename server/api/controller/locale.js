const merge = require('lodash/merge')
const config = require('../../config')
const path = require('path')
const fs = require('fs')
const log = require('../../log')

const localeController = {
  async get (req, res) {
    const locale = req.params.locale
    const locales = require('../../../locales/index')

    // check if this locale exists
    if (!locales[locale]) {
      return res.sendStatus(404)
    }

    const defaultLocaleMessages = require(`../../../locales/${locale}.json`)

    // check if we have a user custom messages
    let customLocaleMessages = {}
    const customLocalePath = path.resolve(config.user_locale, `${locale}.json`)
    if (config.user_locale && fs.existsSync(customLocalePath)) {
      try {
        customLocaleMessages = require(customLocalePath)
      } catch (e) {
        log.error(`Error reading custom locale messages: ${e}`)
      }
    }

    const ret = merge(defaultLocaleMessages, customLocaleMessages)
    return res.json(ret)

  }     
}

module.exports = localeController