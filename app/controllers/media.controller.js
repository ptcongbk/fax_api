const config = require('../../utils/config')
const api = require('../../utils/fax-server')
var uploadApi = new api.UploadApi(config.USERNAME_FAX_SERVER, config.API_TOKEN_KEY_FAX_SERVER)

const db = require("../models");
const Media = db.Media;
const Op = db.Sequelize.Op;

//upload base64 string media files
exports.upload = (req, res) => {
    const convert = req.body['convert'] || 'fax';
    const fileContent = req.body['content'];
    const capacity = req.body['capacity'] || 0;

    var uploadFile = new api.UploadFile()
    uploadFile.content = fileContent
    uploadApi.uploadsPost(uploadFile, convert)
        .then(async function(response) {
            const mediaFile = response.body.data;
            const upload_id = mediaFile['upload_id']
            const name = mediaFile['file_name'];
            const url = mediaFile['_url'];
            const created_at = mediaFile['date_added'];
            const deleted_at = mediaFile['date_delete'];
            Media.create({
                "upload_id": upload_id, 
                "name": name, 
                "url": url, 
                "capacity": capacity, 
                "created_at": created_at, 
                "deleted_at": deleted_at
            }).then(response => {
                const id = response.id

                res.status(200).json({
                    id: id,
                    upload_id: upload_id,
                    name: name,
                    url: url,
                    date_added: created_at,
                    date_deleted: deleted_at
                })
            }).catch(() => {
                const statusCode = 500
                const errorMessage = 'Internal Error'
                console.log(statusCode, errorMessage)
                res.status(statusCode).json({
                    message: errorMessage
                })
            })   
        })
        .catch(function(err){
            const statusCode = err.response.statusCode || 400;
            const errorMessage = err.response.response_msg || 'Bad request'

            console.error(err)
            
            res.status(statusCode).json({
                message: errorMessage
            })
        })
}

//multipart form data
exports.uploadMultipartData = (req, res) => {
    const convert = req.headers['convert'] || 'fax'
    const fileContent = req.file.buffer.toString('base64')
    const capacity = req.headers['capacity'] || 0

    var uploadFile = new api.UploadFile()
    uploadFile.content = fileContent
    
    uploadApi.uploadsPost(uploadFile, convert)
        .then(async function(response) {
            const mediaFile = response.body.data
            const upload_id = mediaFile['upload_id'];
            const name = mediaFile['file_name'];
            const url = mediaFile['_url'];
            const created_at = mediaFile['date_added'];
            const deleted_at = mediaFile['date_delete'];
            
            Media.create({
                "upload_id": upload_id, 
                "name": name, 
                "url": url, 
                "capacity": capacity, 
                "created_at": created_at, 
                "deleted_at": deleted_at
            }).then(response => {
                const id = response.id

                res.status(200).json({
                    id: id,
                    upload_id: upload_id,
                    name: name,
                    url: url,
                    date_added: created_at,
                    date_deleted: deleted_at
                })
            }).catch(function(err) {
                console.log(err)
                const statusCode = 500
                const errorMessage = 'Internal Error'

                res.status(statusCode).json({
                    message: errorMessage
                })
            })
        })
        .catch(function(err){
            console.log(err)
            const statusCode = err.response.statusCode || 400;
            const errorMessage = err.response.response_msg || 'Bad request'

            res.status(statusCode).json({
                message: errorMessage
            })
        })
}