'use strict'

var jwt = require('jsonwebtoken')
var config = require('../../utils/config')
const iDeviceReceiptVerify = require('node-apple-receipt-verify')
const moment = require('moment')
const db = require("../models");
const Fax = db.Fax;
const Op = db.Sequelize.Op;

iDeviceReceiptVerify.config({
    secret: config.IAP_SECRET_KEY,
    environment: ['production', 'sandbox'],
    ignoreExpired: true,
    verbose: true
})

module.exports = {
    verifiedIAP: async (req, res) => {
        const iDeviceReceipt = req.body.receipt
        console.log('reciept', iDeviceReceipt)
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
            var purchaseDate = 0
            var productId = ""
            var expiredAt = 0
            var originalOrderId = ''
            
            console.log('product list:', products)
            
            for(let item of products){
                if(products.length == 1){
                    productId = item.productId
                    expiredAt = item.expirationDate
                    purchaseDate = item.purchaseDate
                    originalOrderId = item.originalTransactionId
                    break
                }
                else{
                    if (item.expirationDate > expiredAt && item.transactionId === item.originalTransactionId) //get latest expired
                    {
                        console.log('item: ', item)
                        productId = item.productId
                        expiredAt = item.expirationDate
                        purchaseDate = item.purchaseDate
                        originalOrderId = item.transactionId
                    }
                }
            }
            console.log(moment.utc(purchaseDate).toDate())
            
            const faxes = await Fax.findAll({
                where: {
                 sender_apple_id: originalOrderId,
                 send_date: {
                    [Op.gte]: moment.utc(purchaseDate).toDate(),
                 },
                },
               });

            let totalSpent = 0;
            console.log('faxes size:', faxes.length)
            
            for (let i = 0; i < faxes.length; i++) {
                totalSpent += parseFloat(faxes[i].total_price)
            }
            //let overBudget = false
            console.log('Total spent', totalSpent)

            let maxSpent = 0
            if(productId == config.IAP_WEEKLY){
                maxSpent = 7.99 * 49 / 100
            }
            else if(productId == config.IAP_MONTHLY){
                maxSpent = 19.99 * 49 / 100
            }
            else if(productId == config.IAP_YEARLY){
                maxSpent = 49.99 * 49 / 100
            }
            
            console.log('total and max', totalSpent, maxSpent)
            
            if(totalSpent >= maxSpent){
                res.status(403).json({
                    message: "Quota exceed"
                })

                return
            }

            var expiredIn = Number.parseInt((expiredAt - Date.now()) / 1000, 10)
            
            console.log('expired In: ', expiredIn)
            if(expiredIn < 1){
                res.status(403).json({
                    message: "receipt expired"
                })

                return
            }
            
            console.log('purchase date string: ', purchaseDate.toString())
            
            const weekBySec = 60 * 60 * 24 * 7
            expiredIn = expiredIn > weekBySec ? weekBySec : expiredIn
            console.log('expired In compare: ', expiredIn)
            
            console.log('jwt sign data: ', productId + purchaseDate.toString())
            
            const token = jwt.sign({
                data: productId + purchaseDate.toString()
            }, config.JWT_SECRET_KEY, {
                expiresIn: expiredIn
            })
            
            console.log('token: ', token)
            
            res.status(200).json({
                "productId": productId,
                "expired_at": expiredAt,
                "originalOrderId": originalOrderId,
                "token": token 
            })
        }catch(error){
            res.status(400).json({
                message: error == null || error == undefined ? 'Bad request' : error
            })
        }
    }
}
