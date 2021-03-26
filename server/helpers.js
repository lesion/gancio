const ical = require('ical.js')
const settingsController = require('./api/controller/settings')
const acceptLanguage = require('accept-language')

const dayjs = require('dayjs')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(timezone)

const config = require('config')
const log = require('./log')
const pkg = require('../package.json')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const axios = require('axios')
const crypto = require('crypto')
const Microformats = require('microformat-node')
const get = require('lodash/get')

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

    // remove FB tracking param
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
      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'br',
        'h6', 'b', 'a', 'li', 'ul', 'ol', 'code', 'blockquote', 'u', 's', 'strong'],
      ALLOWED_ATTR: ['href', 'target']
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
    dayjs.locale(req.settings.locale)
    dayjs.tz.setDefault(req.settings.instance_timezone)
    next()
  },

  async getImageFromURL (url) {
    log.debug(`getImageFromURL ${url}`)
    const filename = crypto.randomBytes(16).toString('hex') + '.jpg'
    const finalPath = path.resolve(config.upload_path, filename)
    const thumbPath = path.resolve(config.upload_path, 'thumb', filename)
    const outStream = fs.createWriteStream(finalPath)
    const thumbStream = fs.createWriteStream(thumbPath)

    const resizer = sharp().resize(1200).jpeg({ quality: 95 })
    const thumbnailer = sharp().resize(400).jpeg({ quality: 90 })

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
  },

  /**
   * Import events from url
   * It does supports ICS and H-EVENT
   */
  async importURL (req, res) {
    const URL = req.query.URL
    try {
      const response = await axios.get(URL)
      const contentType = response.headers['content-type']

      if (contentType.includes('text/html')) {
        Microformats.get({ html: response.data, filter: ['h-event'] }, (err, data) => {
          if (err || !data.items.length || !data.items[0].properties) {
            return res.sendStatus(404)
          }
          const events = data.items.map(e => {
            const props = e.properties
            return {
              title: get(props, 'name[0]', ''),
              description: get(props, 'description[0]', ''),
              place: get(props, 'location[0].properties.name', ''),
              address: get(props, 'location[0].properties.street-address'),
              start: get(props, 'start[0]', ''),
              end: get(props, 'end[0]', ''),
              tags: get(props, 'category', []),
              image: get(props, 'featured[0]')
            }
          })
          return res.json(events)
        })
      } else if (contentType.includes('text/calendar')) {
        const ret = ical.parse(response.data)
        const component = new ical.Component(ret)
        const events = component.getAllSubcomponents('vevent')
        return res.json(events.map(e => {
          const event = new ical.Event(e)
          return {
            title: get(event, 'summary', ''),
            description: get(event, 'description', ''),
            place: get(event, 'location', ''),
            start: get(event, 'dtstart', ''),
            end: get(event, 'dtend', '')
          }
        }))
      }
      // const event = dom.window.document.querySelected(".h-event")
      // console.error(event)
      // console.error(response)
    } catch (e) {
      log.error(e)
    }

    // res.json('ok')
  }

}
