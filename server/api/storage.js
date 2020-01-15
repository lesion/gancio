const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const mkdirp = require('mkdirp')
const sharp = require('sharp')
const debug = require('debug')('storage')
const config = require('config')

try {
  mkdirp.sync(config.upload_path + '/thumb')
} catch (e) {
  debug.warn(e)
}

const DiskStorage = {
  _handleFile (req, file, cb) {
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

    outStream.on('finish', function () {
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
