const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const mkdirp = require('mkdirp')
const sharp = require('sharp')
const log = require('../log')
const config = require('../config')

try {
  mkdirp.sync(config.upload_path + '/thumb')
} catch (e) {}

const DiskStorage = {
  _handleFile (req, file, cb) {
    const filename = crypto.randomBytes(16).toString('hex')
    const sharpStream = sharp({ failOnError: true })
    const promises = [
      sharpStream.clone().resize(500, null, { withoutEnlargement: true }).jpeg({ mozjpeg: true, progressive: true }).toFile(path.resolve(config.upload_path, 'thumb', filename + '.jpg')),
      sharpStream.clone().resize(1200, null, { withoutEnlargement: true } ).jpeg({ quality: 95, mozjpeg: true, progressive: true }).toFile(path.resolve(config.upload_path, filename + '.jpg')),
      sharpStream.clone()
        .resize(5)
        .png({ quality: 10, palette: true, effort: 6})
        .toBuffer()
        .then(buffer => buffer.toString('base64'))
    ]

    file.stream.pipe(sharpStream)
    Promise.all(promises)
      .then(res => {
        const info = res[1]
        const preview = res[2]
        cb(null, {
          destination: config.upload_path,
          filename: filename + '.jpg',
          path: path.resolve(config.upload_path, filename + '.jpg'),
          height: info.height,
          width: info.width,
          size: info.size,
          preview
        })
      })
      .catch(err => {
        console.error(err)
        req.err = err
        cb(null)
      })
  },
  _removeFile (_req, file, cb) {
    delete file.destination
    delete file.filename
    fs.unlink(file.path, cb)
    delete file.path
  }
}

module.exports = DiskStorage
