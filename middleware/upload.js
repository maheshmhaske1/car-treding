const multer = require('multer')

exports.upload_pan = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `./public/PAN/`)
        },
        filename: function (req, file, cb) {
            cb(null, `profile_image_` + `${Date.now()}` + `_` + file.originalname)
        }
    }),
}).single('PAN')


exports.upload_vehicle = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `./public/vehicle/`)
        },
        filename: function (req, file, cb) {
            cb(null, `vehicle` + `${Date.now()}` + `_` + file.originalname)
        }
    }),
}).single('vehicle')



