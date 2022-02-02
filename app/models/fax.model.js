module.exports = (sequelize, Sequelize) => {
    const Fax = sequelize.define("Fax", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
    
        message: {
            type: Sequelize.TEXT
        },

        contact_name: {
            type: Sequelize.TEXT
        },

        contact_phone: {
            type: Sequelize.STRING(100)
        },

        recipient_fax: {
            type: Sequelize.STRING(100)
        },

        recipient_country_code: {
            type: Sequelize.STRING(10)
        },

        status: {
            type: Sequelize.STRING(50)
        },

        ip_address: {
            type: Sequelize.STRING(20)
        },

        sender_apple_id: {
            type: Sequelize.STRING(255)
        },

        sender_name: {
            type: Sequelize.STRING(255)
        },

        sender_email: {
            type: Sequelize.STRING(100)
        },

        sender_fax: {
            type: Sequelize.STRING(100)
        },

        send_date: {
            type: Sequelize.DATE  
        },
        
        total_price: {
            type: Sequelize.DECIMAL
        },
    });
    
    return Fax;
}