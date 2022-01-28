const router = require('express').Router()
const controller = require('./../controllers/fax.controller')

router.post('/send', controller.send)
module.exports = router