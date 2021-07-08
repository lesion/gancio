const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const mkdirp = require('mkdirp')
const sharp = require('sharp')
const log = require('../log')
const config = require('config')

try {
  mkdirp.sync(config.upload_path + '/thumb')
} catch (e) {}

const DiskStorage = {
  _handleFile (req, file, cb) {
    const filename = crypto.randomBytes(16).toString('hex') + '.jpg'
    const finalPath = path.resolve(config.upload_path, filename)
    const thumbPath = path.resolve(config.upload_path, 'thumb', filename)
    const outStream = fs.createWriteStream(finalPath)
    const thumbStream = fs.createWriteStream(thumbPath)

    const resizer = sharp().resize(1200).jpeg({ quality: 98 })
    const thumbnailer = sharp().resize(400).jpeg({ quality: 90 })
    let onError = false
    const err = e => {
      if (onError) {
        log.error('[UPLOAD]', err)
        return
      }
      onError = true
      log.error('[UPLOAD]', e)
      req.err = e
      cb(null)
    }

    file.stream
      .pipe(thumbnailer)
      .on('error', err)
      .pipe(thumbStream)
      .on('error', err)

    file.stream
      .pipe(resizer)
      .on('error', err)
      .pipe(outStream)
      .on('error', err)

    outStream.on('finish', () => {
      cb(null, {
        destination: config.upload_path,
        filename,
        path: finalPath,
        size: outStream.bytesWritten
      })
    })
  },
  _removeFile (req, file, cb) {
    delete file.destination
    delete file.filename
    fs.unlink(file.path, cb)
    delete file.path
  }
}

module.exports = DiskStorage
