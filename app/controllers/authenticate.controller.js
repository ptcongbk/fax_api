'use strict'

var jwt = require('jsonwebtoken')
var config = require('../../utils/config')
const iDeviceReceiptVerify = require('node-apple-receipt-verify')

iDeviceReceiptVerify.config({
    secret: config.IAP_SECRET_KEY,
    environment: ['production', 'sandbox'],
    ignoreExpired: true,
    verbose: true
})

module.exports = {
    verifiedIAP: async (req, res) => {
        const iDeviceReceipt = req.body.receipt

        try{
            const products = await iDeviceReceiptVerify.validate({
                receipt: iDeviceReceipt
            })

            //empty
            if(products.length === 0){
                res.status(403).json({
                    message: "not products"
                })
                return
            }

            const secret = req.app.get('jwt-secret')
            var purchasedDate = 0
            var productId = ""
            var expiredAt = 0

            for(let item of products){
                //lifetime
                if(item.productId === config.IAP_LIFETIME){
                    productId = config.IAP_LIFETIME
                    purchasedDate = item.purchasedDate
                    break
                }

                if(item.productId === config.IAP_MONTHLY){
                    productId = config.IAP_MONTHLY
                    expiredAt = expiredAt > item.expirationDate ? expiredAt : item.expirationDate
                    purchaseDate = expiredAt > item.expirationDate ? purchaseDate : item.purchaseDate
                    continue
                }

                productId = item.productId
                expiredAt = expiredAt > item.expirationDate ? expiredAt : item.expirationDate
                purchaseDate = expiredAt > item.expirationDate ? purchaseDate : item.purchaseDate
            }

            var expiredIn = Number.parseInt((expiredAt - Date.now()) / 1000, 10)
            if(expireIn < 1){
                res.status(403).json({
                    message: "receipt expired"
                })

                return
            }

            const weekBySec = 60 * 60 * 24 * 7
            expiredIn = expiredIn > weekBySec ? weekBySec : expiredIn
            const token = jwt.sign({
                data: productId + purchasedDate.toString()
            }, config.JWT_SECRET_KEY, {
                expiredIn: expiredIn
            })

            res.status(200).json({
                "productId": productId,
                "expired_at": expiredAt,
                "token": token 
            })
        }catch(error){
            res.status(400).json({
                message: error == null || error == undefined ? 'Bad request' : error
            })
        }
    }
}