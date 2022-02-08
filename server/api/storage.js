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
    const imgPath = path.resolve(config.upload_path, filename)
    const thumbPath = path.resolve(config.upload_path, 'thumb', filename)

    const sharpStream = sharp({ failOnError: false })
    const promises = []

    // fallback jpeg thumb
    promises.push(
      sharpStream
        .clone()
        .resize(500, null, { withoutEnlargement: true })
        .jpeg({ quality: 90, mozjpeg: true })
        .toFile(thumbPath + '.jpg')
    )

    // fallback jpeg img
    promises.push(
      sharpStream
        .clone()
        .resize(1600, null, { withoutEnlargement: true })
        .jpeg({ quality: 90, mozjpeg: true })
        .toFile(imgPath + '.jpg')
    )

    // webp thumb
    promises.push(
      sharpStream
        .clone()
        .resize(500, null, { withoutEnlargement: true })
        .webp({ nearLossLess: true })
        .toFile(thumbPath + '.webp')
    )

    // webp image
    promises.push(
      sharpStream
        .clone()
        .resize(1600, null, { withoutEnlargement: true })
        .webp({ nearLossLess: true })
        .toFile(imgPath + '.webp')
    )

    file.stream.pipe(sharpStream)

    Promise.all(promises)
      .then(ret => { 
        console.error(ret)
        cb(null, { filename, path: imgPath }) 
      })
      .catch(err => {
        log.error("Error processing files, let's clean it up" + err)
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
