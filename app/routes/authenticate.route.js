const router = require('express').Router()
const controller = require('./../controllers/authenticate.controller')

router.post('/iap/verified', controller.verifiedIAP)

module.exports = router
