const router = require('express').Router();
const controller = require('./../controllers/media.controller');

router.post('/upload', controller.upload)
router.post('/upload-multipart-data', controller.uploadMultipartData)
module.exports = router