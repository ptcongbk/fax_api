const router = require('express').Router()
const authMiddleware = require('./../../utils/middleware/authentication')
const auth = require('./authenticate.route')
const fax = require('./fax.route')
const upload = require('./upload.route')
var uploaderMiddleware = require('./../../utils/middleware/uploader');

// Auth routes
router.use('/auth', auth)

// Upload routes
router.use('/media/upload-multipart-data', uploaderMiddleware)
router.use('/media', authMiddleware)
router.use('/media', upload)

// Fax routes
router.use('/fax', authMiddleware)
router.use('/fax', fax)

module.exports = router