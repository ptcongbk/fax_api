'use strict'

const dbConfig = require('./../../utils/db.config');

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
    },
    ssl: true,
    operatorsAliases: 0,
    port: dbConfig.port,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//Model objects
db.Fax = require('./fax.model')(sequelize, Sequelize);
db.Media = require('./media.model')(sequelize, Sequelize);

//Relations
//db.Fax.hasMany(db.Media);
// db.Media.belongsTo(db.Fax, {
//     foreignKey: "faxId",
//     as: "fax"
// })

module.exports = db;