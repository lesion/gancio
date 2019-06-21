const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const mkdirp = require('mkdirp')
const sharp = require('sharp')
const consola = require('consola')
const config = require('config')

mkdirp.sync(config.upload_path + '/thumb')

const DiskStorage = {
  _handleFile(req, file, cb) {
    const filename = crypto.randomBytes(16).toString('hex') + '.jpg'
    const finalPath = path.resolve(config.upload_path, filename)
    const thumbPath = path.resolve(config.upload_path, 'thumb', filename)
    const outStream = fs.createWriteStream(finalPath)
    const thumbStream = fs.createWriteStream(thumbPath)
    const resizer = sharp().resize(800).jpeg({ quality: 90 })
    const thumbnailer = sharp().resize(400).jpeg({ quality: 90 })

    file.stream.pipe(thumbnailer).pipe(thumbStream)
    thumbStream.on('error', e => consola.error('thumbStream error ', e))

    file.stream.pipe(resizer).pipe(outStream)
    outStream.on('error', cb)
    outStream.on('finish', function () {
      cb(null, {
        destination: config.upload_path,
        filename,
        path: finalPath,
        size: outStream.bytesWritten
      })
    })
  },
  _removeFile(req, file, cb) {
    delete file.destination
    delete file.filename
    delete file.path
    fs.unlink(path, cb)
  }
}

module.exports = DiskStorage
