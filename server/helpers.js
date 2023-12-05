const ical = require('ical.js')
const settingsController = require('./api/controller/settings')
const express = require('express')
const dayjs = require('dayjs')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(timezone)

const config = require('./config')
const log = require('./log')
const pkg = require('../package.json')
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

  randomString(length = 12) {
    const wishlist = '0123456789abcdefghijklmnopqrstuvwxyz'
    return Array.from(crypto.randomFillSync(new Uint32Array(length)))
      .map(x => wishlist[x % wishlist.length])
      .join('')
  },

  sanitizeHTML(html) {
    return domPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'br', 'i', 'span',
        'h6', 'b', 'a', 'li', 'ul', 'ol', 'code', 'blockquote', 'u', 's', 'strong'],
      ALLOWED_ATTR: ['href', 'target']
    })
  },


  async initSettings(_req, res, next) {
    // initialize settings
    // res.locals.settings = cloneDeep(settingsController.settings)
    const settings = settingsController.settings
    res.locals.settings = {
      title: settings.title || config.title,
      description: settings.description || config.description,
      baseurl: config.baseurl,
      hostname: config.hostname,
      version: pkg.version,
      instance_timezone: settings.instance_timezone,
      instance_locale: settings.instance_locale,
      instance_name: settings.instance_name,
      instance_place: settings.instance_place,
      allow_registration: settings.allow_registration,
      allow_anon_event: settings.allow_anon_event,
      allow_recurrent_event: settings.allow_recurrent_event,
      allow_multidate_event: settings.allow_multidate_event,
      allow_online_event: settings.allow_online_event,
      recurrent_event_visible: settings.recurrent_event_visible,
      enable_federation: settings.enable_federation,
      enable_resources: settings.enable_resources,
      hide_boosts: settings.hide_boosts,
      enable_trusted_instances: settings.enable_trusted_instances,
      trusted_instances: settings.trusted_instances,
      trusted_instances_label: settings.trusted_instances_label,
      'theme.is_dark': settings['theme.is_dark'],
      dark_colors: settings.dark_colors,
      light_colors: settings.light_colors,
      hide_thumbs: settings.hide_thumbs,
      hide_calendar: settings.hide_calendar,
      allow_geolocation: settings.allow_geolocation,
      geocoding_provider_type: settings.geocoding_provider_type,
      geocoding_provider: settings.geocoding_provider,
      geocoding_countrycodes: settings.geocoding_countrycodes,
      tilelayer_provider: settings.tilelayer_provider,
      tilelayer_provider_attribution: settings.tilelayer_provider_attribution,
      footerLinks: settings.footerLinks,
      admin_email: settings.admin_email,
      about: settings.about,
    }
    next()
  },

  serveStatic() {
    const router = express.Router()
    // serve images/thumb
    router.use('/media/', express.static(config.upload_path, { immutable: true, maxAge: '1y' }), (_req, res) => res.sendStatus(404))
    router.use('/download/:filename', (req, res) => {
      res.download(req.params.filename, undefined, { root: config.upload_path }, err => {
        if (err) {
          // Check if headers have been sent
          if(res.headersSent) {
            log.warn(err)
          } else {
            res.status(404).send('Not found (but nice try 😊)')
          }
        }
      })
    })

    router.use('/fallbackimage.png', (req, res, next) => {
      const fallbackImagePath =  settingsController.settings.fallback_image || './static/noimg.svg'
      return express.static(fallbackImagePath)(req, res, next)
    })

    router.use('/headerimage.png', (req, res, next) => {
      const headerImagePath =  settingsController.settings.header_image || './static/noimg.svg'
      return express.static(headerImagePath)(req, res, next)
    })

    router.use('/logo.png', (req, res, next) => {
      const logoPath = settingsController.settings.logo || './static/gancio'
      return express.static(logoPath + '.png')(req, res, next)
    })

    router.use('/favicon.ico', (req, res, next) => {
      const faviconPath = res.locals.settings.logo ? res.locals.settings.logo + '.png' : './assets/favicon.ico'
      return express.static(faviconPath)(req, res, next)
    })

    return router
  },

  logRequest(req, _res, next) {
    log.debug(`${req.method} ${req.path}`)
    next()
  },

  col(field) {
    if (config.db.dialect === 'postgres') {
      return '"' + field.split('.').join('"."') + '"'
    } else if (config.db.dialect === 'mariadb') {
      return '`' + field.split('.').join('`.`') + '`'
    } else {
      return field
    }
  },

  async getImageFromURL(url) {
    log.debug(`getImageFromURL ${url}`)

    const filename = crypto.randomBytes(16).toString('hex')
    const sharpStream = sharp({ failOnError: true })
    const promises = [
      sharpStream.clone().resize(500, null, { withoutEnlargement: true }).jpeg({ effort: 6, mozjpeg: true }).toFile(path.resolve(config.upload_path, 'thumb', filename + '.jpg')),
      sharpStream.clone().resize(1200, null, { withoutEnlargement: true }).jpeg({ quality: 95, effort: 6, mozjpeg: true }).toFile(path.resolve(config.upload_path, filename + '.jpg')),
    ]

    const response = await axios({ method: 'GET', url: encodeURI(url), responseType: 'stream' })

    response.data.pipe(sharpStream)
    return Promise.all(promises)
      .then(res => {
        const info = res[1]
        return {
          destination: config.upload_path,
          filename: filename + '.jpg',
          path: path.resolve(config.upload_path, filename + '.jpg'),
          height: info.height,
          width: info.width,
          size: info.size,
        }
      })
      .catch(err => {
        log.error(err)
        req.err = err
        cb(null)
      })
  },

  /**
   * Import events from url
   * It does supports ICS and H-EVENT
   */
  async importURL(req, res) {
    const url = req.query.URL
    try {
      const response = await axios.get(url)
      const contentType = response.headers['content-type']

      if (contentType.includes('text/html')) {
        Microformats.get({ html: response.data, filter: ['h-event'] }, (err, data) => {
          if (err || !data.items.length || !data.items[0].properties) {
            return res.sendStatus(404)
          }
          const events = data.items.map(e => {
            const props = e.properties
            let media = get(props, 'featured[0]')
            if (media) {
              media = URL.resolve(url, media)
            }
            return {
              title: get(props, 'name[0]', ''),
              description: get(props, 'description[0]', ''),
              place: {
                name: get(props, 'location[0].properties.name[0].value', '') || get(props, 'location[0].properties.name', '') || get(props, 'location[0]'),
                address: get(props, 'location[0].properties.street-address[0]') || get(props, 'location[0].properties.street-address')
              },
              start_datetime: dayjs(get(props, 'start[0]', '')).unix(),
              end_datetime: dayjs(get(props, 'end[0]', '')).unix(),
              tags: get(props, 'category', []),
              media: media ? [{ name: get(props, 'name[0]', ''), url: media, focalpoint: [0, 0] }] : []
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
            place: { name: get(event, 'location', '') },
            start_datetime: dayjs(get(event, 'startDate', null)).unix(),
            end_datetime: dayjs(get(event, 'endDate', null)).unix()
          }
        }))
      }
    } catch (e) {
      log.error('[Import URL]', e)
      res.status(400).json(e.toString())
    }
  },

  getWeekdayN(date, n, weekday) {
    let cursor
    if (n === -1) {
      cursor = date.endOf('month')
      cursor = cursor.set({ weekday })
      if (cursor.month !== date.month) {
        cursor = cursor.minus({ days: 7 })
      }
    } else {
      cursor = date.startOf('month')
      // cursor = cursor.add(cursor.day <= date.day ? n - 1 : n, 'week')
      cursor = cursor.plus({ weeks: cursor.weekday <= weekday ? n-1 : n })
      cursor = cursor.set({ weekday })
    }
    cursor = cursor.set({ hour: date.hour, minute: date.minute, second: 0 })
    log.debug(cursor)
    return cursor
  },

  async APRedirect(req, res, next) {
    const eventController = require('../server/api/controller/event')
    const acceptJson = req.accepts('html', 'application/activity+json') === 'application/activity+json'
    if (acceptJson) {
      const event = await eventController._get(req.params.slug)
      if (event) {
        return res.redirect(`/federation/m/${event.id}`)
      }
    }
    next()
  },

  async feedRedirect(req, res, next) {
    const accepted = req.accepts('html', 'application/rss+xml', 'text/calendar')
    if (['application/rss+xml', 'text/calendar'].includes(accepted) && /^\/(tag|place|collection)\/.*/.test(req.path)) {
      return res.redirect((accepted === 'application/rss+xml' ? '/feed/rss' : '/feed/ics') + req.path)
    }
    next()
  },

  async reachable(req, res) {
    try {
      await axios({ url: config.baseurl })
      return res.sendStatus(200)
    } catch(e) {
      log.debug(e)
      return res.sendStatus(400)
    }
  },

  async isGeocodingEnabled(req, res, next) {
    if (res.locals.settings.allow_geolocation) {
      next()
    } else {
      res.sendStatus(403)
    }
  },

  queryParamToBool (value, defaultValue) {
    if (typeof value === 'undefined') return defaultValue
    return (String(value).toLowerCase() === 'true')
  }

}
