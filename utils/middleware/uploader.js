'use strict';

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer( { storage: storage }).single("content");

const uploadMiddleware = async (req, res, next) => {
    upload(req, res, err => {
        if(err){
            console.log("error when uploading: ", err);
            return res.sendStatus(500);
        }

        next();
    }) 
}

module.exports = uploadMiddleware;