'use strict'

const jwt = require('jsonwebtoken');

const authenticateMiddleware = (req, res, next) => {
    //token from header or url
    const token = req.headers['x-access-token'] || req.query.token;

    //not exist
    if(!token){
        return res.status(401).json({
            message: 'user not logged in'
        })
    }

    var decodedPromise = new Promise((resolve, reject) => {
        jwt.verify(token, req.app.get('jwt-secret'), (error, decoded) => {
            if(error){
                reject(error);
            }

            resolve(decoded);
        })
    });

    //verified failed
    const onError = (error) => {
        res.status(403).json({
            message: error.message
        });
    }

    //process decoded promise
    decodedPromise.then((decoded) => {
        req.decoded = decoded;
        next();
    }).catch(onError)
}

module.exports = authenticateMiddleware;