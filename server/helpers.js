const settingsController = require('./api/controller/settings')
const acceptLanguage = require('accept-language')
const moment = require('moment-timezone')
const path = require('path')
const sharp = require('sharp')
const fs = require('fs')
const axios = require('axios')
const config = require('config')
const crypto = require('crypto')
const debug = require('debug')('helpers')
const pkg = require('../package.json')

module.exports = {

  async initSettings (req, res, next) {
    await settingsController.load()
    // initialize settings
    req.settings = settingsController.settings
    req.secretSettings = settingsController.secretSettings

    req.settings.baseurl = config.baseurl
    req.settings.title = req.settings.title || config.title
    req.settings.description = req.settings.description || config.description
    req.settings.version = pkg.version

    // set locale and user locale
    const acceptedLanguages = req.headers['accept-language']
    const supportedLanguages = ['en', 'it', 'es', 'ca']
    acceptLanguage.languages(supportedLanguages)
    req.settings.locale = acceptLanguage.get(acceptedLanguages)
    req.settings.user_locale = settingsController.user_locale[req.settings.locale]
    moment.locale(req.settings.locale)
    moment.tz.setDefault(req.settings.instance_timezone)
    next()
  },

  async downloadImage (url) {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })

    const filename = crypto.randomBytes(16).toString('hex') + '.webp'
    const finalPath = path.resolve(config.upload_path, filename)
    const thumbPath = path.resolve(config.upload_path, 'thumb', filename)
    const outStream = fs.createWriteStream(finalPath)
    const thumbStream = fs.createWriteStream(thumbPath)

    const resizer = sharp().resize(1200).webp({ quality: 95 })
    const thumbnailer = sharp().resize(400).webp({ quality: 90 })
    let onError = false
    const err = e => {
      if (onError) {
        return
      }
      onError = true
      debug(e)
      // cb(null)
    }

    response.data
      .pipe(thumbnailer)
      .on('error', err)
      .pipe(thumbStream)
      .on('error', err)

    response.data
      .pipe(resizer)
      .on('error', err)
      .pipe(outStream)
      .on('error', err)

    return new Promise((resolve, reject) => {
      outStream.on('error', reject)
      outStream.on('finish', function () {
        debug('outStream finish ', filename)
        resolve(filename)
        debug({
          destination: config.upload_path,
          filename,
          path: finalPath,
          size: outStream.bytesWritten
        })
      })
    })
  }

}
