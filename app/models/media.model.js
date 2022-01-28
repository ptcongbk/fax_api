module.exports = (sequelize, Sequelize) => {
    const Media = sequelize.define("Media", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        upload_id: {
            type: Sequelize.STRING(255)
        },

        name: {
            type: Sequelize.STRING(255)
        },

        url: {
            type: Sequelize.TEXT
        },

        capacity: {
            type: Sequelize.INTEGER
        },

        created_at: {
            type: Sequelize.DATE
        },

        deleted_at: {
            type: Sequelize.DATE
        },

        fax_id: {
            type: Sequelize.INTEGER
        }
    })

    return Media
}