'use strict'

var jwt = require('jsonwebtoken')
var config = require('../../utils/config')
const iDeviceReceiptVerify = require('node-apple-receipt-verify')

iDeviceReceiptVerify.config({
    secret: config.IAP_SECRET_KEY,
    environment: [config.IAP_MODE], //change production here
    ignoreExpired: config.IAP_MODE === 'sandbox'?false:true,
    verbose: true
})

module.exports = {
    verifiedIAP: async (req, res) => {
        const iDeviceReceipt = req.body.receipt

        try{
            const products = await iDeviceReceiptVerify.validate({
                  receipt: iDeviceReceipt
                });

            //empty
            console.log(products)
            if(products.length === 0){
                res.status(403).json({
                    message: "not products"
                })
                return
            }

            const secret = req.app.get('jwt-secret')
            var purchaseDate = 0
            var productId = ""
            var expiredAt = 0
            for(let item of products){
                if (item.expirationDate > expiredAt) //get latest expired
                {
                    productId = item.productId
                    expiredAt = item.expirationDate
                    purchaseDate = item.purchaseDate
                }
            }
            if(expiredAt !== 0 && config.IAP_MODE ==="sandbox"){
                expiredAt = Date.now() + 6.048e+8; //add 1 week
            }
            var expiredIn = Number.parseInt((expiredAt - Date.now()) / 1000, 10)
            if(expiredIn < 1){
                res.status(403).json({
                    message: "receipt expired"
                })

                return
            }

            const weekBySec = 60 * 60 * 24 * 7
            expiredIn = expiredIn > weekBySec ? weekBySec : expiredIn
            const token = jwt.sign({
                data: productId + purchaseDate.toString()
            }, config.JWT_SECRET_KEY, {
                expiresIn: expiredIn
            })

            res.status(200).json({
                "productId": productId,
                "expired_at": expiredAt,
                "token": token 
            })
        }catch(error){
            console.log(error)
            res.status(400).json({
                message: error == null || error == undefined ? 'Bad request' : error
            })
        }
    }
}