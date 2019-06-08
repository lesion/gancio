const fs = require('fs')
const os = require('os')
const path = require('path')
const crypto = require('crypto')
const mkdirp = require('mkdirp')
const sharp = require('sharp')

function getDestination(req, file, cb) {
  cb(null, os.tmpdir())
}

function DiskStorage(opts) {
  if (typeof opts.destination === 'string') {
    mkdirp.sync(opts.destination)
    this.getDestination = function ($0, $1, cb) { cb(null, opts.destination) }
  } else {
    this.getDestination = (opts.destination || getDestination)
  }
}

DiskStorage.prototype._handleFile = function _handleFile(req, file, cb) {
  const that = this
  that.getDestination(req, file, function (err, destination) {
    if (err) return cb(err)

    const filename = crypto.randomBytes(16).toString('hex') + '.jpg'
    const finalPath = path.join(destination, filename)
    const thumbPath = path.join(destination, 'thumb', filename)
    const outStream = fs.createWriteStream(finalPath)
    const thumbStream = fs.createWriteStream(thumbPath)
    const resizer = sharp().resize(800).jpeg({ quality: 90 })
    const thumbnailer = sharp().resize(400).jpeg({ quality: 90 })

    file.stream.pipe(thumbnailer).pipe(thumbStream)
    thumbStream.on('error', e => console.log('thumbStream error ', e))

    file.stream.pipe(resizer).pipe(outStream)
    outStream.on('error', cb)
    outStream.on('finish', function () {
      cb(null, {
        destination,
        filename,
        path: finalPath,
        size: outStream.bytesWritten
      })
    })
  })
}

DiskStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  let path = file.path

  delete file.destination
  delete file.filename
  delete file.path

  fs.unlink(path, cb)
}

module.exports = function (opts) {
  return new DiskStorage(opts)
}
