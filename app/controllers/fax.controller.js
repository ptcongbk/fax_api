const config = require('../../utils/config')
const api = require('../../utils/fax-server')

const FaxApi = new api.FAXApi(
    config.USERNAME_FAX_SERVER,
    config.API_TOKEN_KEY_FAX_SERVER
)

const requestIp = require('request-ip')
const moment = require('moment')
const db = require("../models");
const Fax = db.Fax;
const Media = db.Media;
const Op = db.Sequelize.Op;
const Sequelize = db.Sequelize;

//Send
exports.send = async (req, res) => {
    //get request header
    const source = req.body['source'] || 'node'
    const senderName = req.body['sender_name']
    const senderFax = req.body['sender_fax'] || '';
    const senderEmail = req.body['sender_email'] || '';
    const senderAppleId = req.body['apple_id'] || '';
    const senderSubscriptionId = req.body['apple_subscription'] || 1;
    const recipientFax = req.body['recipient_fax'] || '';
    const recipientCountryCode = req.body['recipient_country_code'] || '';
    const recipientPhoneCode = req.body['recipient_phone_code'] || '';
    const contactName = req.body['contact_name'] || '';
    const contactPhone = req.body['contact_phone'] || '';
    const message = req.body['message'] || '';
    const attachments = req.body['attachments'] || [];
    if (recipientFax === null || recipientFax === '' || recipientFax === undefined) {
        return res.status(400).json({
            message: "not have recipient fax number"
        })
    }

    if (attachments.length === 0) {
        return res.status(400).json({
            message: "not have attachment"
        })
    }

    /*
        Get total spending over 30 days and check with subscription id
        1: Week, 2: Month, 3: Yearly
    */
    let interval = 0
    switch(senderSubscriptionId){
        case 1:
            interval = 7
            break
        case 2:
            interval = 30
            break
        default:
            interval = 365
    }
    const faxes = await Fax.findAll({
        where: {
         sender_apple_id: req.body['apple_id'] ,
         send_date: {
            [Op.gte]: moment().subtract(7, 'days').toDate(),
         },
        },
       });
    let totalSpent = 0;
    for (let i = 0; i < faxes.length; i++) {
        totalSpent += parseFloat(faxes[i].total_price)
    }
    let overBudget = false
    console.log('Total spent', totalSpent)
    
    switch(senderSubscriptionId){
        case 1: // for testing only
            if(totalSpent >= 1) overBudget = true
            break
        case 2:
            if(totalSpent >= 8) overBudget = true
            break
        default:
            if(totalSpent >= 95) overBudget = true
            break
    }

    if(overBudget){
        return res.status(400).json({
            message: "over budget"
        })
    }

    // return res.status(400).json({
    //     message: "testing"
    // })

    /*
        Start sending the fax
    */
    const ipAddress = requestIp.getClientIp(req)
    let promises = []
    let medias = []

    for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i]
        medias.push(attachment['id'])
        const url = attachment['url']

        //keep track fax transaction - call api for sending
        var faxMessageList = new api.FaxMessage()
        faxMessageList.source = source;
        faxMessageList.to = recipientFax;
        faxMessageList.from = senderFax;
        faxMessageList.customString = message;
        faxMessageList.fromEmail = senderEmail;
        faxMessageList.country = recipientCountryCode;

        // console.log(faxMessageList)

        //fax message
        var faxMessage = new api.FaxMessageCollection()
        faxMessage.messages = [faxMessageList]
        faxMessage.fileUrl = url

        let rp = new Promise((resolve, reject) => {
            FaxApi.faxSendPost(faxMessage)
                .then((response) => {

                    const rawMessages = response.body.data.messages
                    // console.log('after call clicksend apis', rawMessages)
                    if (rawMessages.length === 0) {
                        reject({
                            status: 400,
                            message: 'Bad request',
                            total_price: 0
                        })
                    }
                    const total_price = response.body.data.total_price
                    let message = rawMessages[0].status || 'SUCCESS'
                    let status = message.toLowerCase() === 'success' ? 200 : 400
                    resolve({
                        status: status,
                        message: message,
                        total_price: total_price
                    })
                })
                .catch(function (err) {
                    console.log(err)
                })
        })

        promises.push(rp)
    }

    Promise.all(promises).then(async (values) => {
        let status = 200
        let message = 'succesfully sent'
        let total_price = 0
        values.forEach((item) => {
            if (item.status !== 200) { //ERROR
                status = item.status
                message = item.message
            } else {
                total_price += item.total_price
            }
        })

        //write fax transaction
        Fax.create({
            "message": message,
            "contact_name": contactName,
            "contact_phone": contactPhone,
            "status": status,
            "ip_address": ipAddress,
            "sender_apple_id": senderAppleId,
            "sender_fax": senderFax,
            "sender_name": senderName,
            "sender_email": senderEmail,
            "recipient_fax": recipientFax,
            "recipient_country_code": recipientCountryCode,
            "total_price": total_price,
            "send_date":  new Date(),
        })
            .then((result) => {
                const faxId = result.id;
                //update medias with faxid
                Media.update({
                    fax_id: faxId
                }, {
                    where: {
                        id: {
                            [Op.in]: medias
                        }
                    }
                })
            })
            .catch(function (err) {
                console.log(err)
            })

        res.status(status).json({
            message: message
        })
    })
}

