const settingsController = require('./api/controller/settings')
const acceptLanguage = require('accept-language')
const moment = require('moment-timezone')
const config = require('config')
const debug = require('debug')('helpers')
const pkg = require('../package.json')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const axios = require('axios')
const crypto = require('crypto')

const DOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const { window } = new JSDOM('<!DOCTYPE html>')
const domPurify = DOMPurify(window)
const URL = require('url')
const locales = require('../locales')

domPurify.addHook('beforeSanitizeElements', node => {
  if (node.hasAttribute && node.hasAttribute('href')) {
    const href = node.getAttribute('href')
    const text = node.textContent
    if (href.includes('fbclid=')) {
      try {
        const url = new URL.URL(href)
        url.searchParams.delete('fbclid')
        node.setAttribute('href', url.href)
        if (text.includes('fbclid=')) {
          node.textContent = url.href
        }
      } catch (e) {
        return node
      }
    }
  }
  return node
})

module.exports = {
  sanitizeHTML (html) {
    return domPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5',
        'h6', 'b', 'a', 'li', 'ul', 'ol', 'code', 'blockquote', 'u', 's', 'strong'],
      ALLOWED_ATTR: ['href']
    })
  },

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
    acceptLanguage.languages(Object.keys(locales))
    req.settings.locale = acceptLanguage.get(acceptedLanguages)
    req.settings.user_locale = settingsController.user_locale[req.settings.locale]
    moment.locale(req.settings.locale)
    moment.tz.setDefault(req.settings.instance_timezone)
    next()
  },

  async getImageFromURL (url) {
    debug(`getImageFromURL ${url}`)
    const filename = crypto.randomBytes(16).toString('hex') + '.webp'
    const finalPath = path.resolve(config.upload_path, filename)
    const thumbPath = path.resolve(config.upload_path, 'thumb', filename)
    const outStream = fs.createWriteStream(finalPath)
    const thumbStream = fs.createWriteStream(thumbPath)

    const resizer = sharp().resize(1200).webp({ quality: 95 })
    const thumbnailer = sharp().resize(400).webp({ quality: 90 })

    const response = await axios({ method: 'GET', url, responseType: 'stream' })

    return new Promise((resolve, reject) => {
      let onError = false
      const err = e => {
        if (onError) {
          return
        }
        onError = true
        reject(e)
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

      outStream.on('finish', () => resolve(filename))
    })
  }

}
