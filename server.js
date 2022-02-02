const express = require('express')
let app = express()
let port = process.env.PORT || 8183

const config = require('./utils/config')
var bodyParser = require('body-parser')

//Set secret key
app.set('jwt-secret', config.JWT_SECRET_KEY)

//use of body parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: "50mb", extended: true }))

const db = require('./app/models');
db.sequelize.sync({
    // force: true
    })
    .then((result) => {
        // console.log(result);
    })
    .catch((err) => {
        console.log(err);
    });

//config route
app.use('/api', require('./app/routes'))

//not found
app.use(function(req, res){
    res.status(404).send({ url: req.originalUrl + ' not found'})
})

//start server
app.listen(port, () => {
    console.log('App Server started on: ' + port)
})

app.timeout = 1000;