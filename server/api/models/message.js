module.exports = (sequelize, DataTypes) => 
sequelize.define('message', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    author: {
        type: DataTypes.ENUM,
        values: ['AUTHOR', 'ADMIN', 'ANON', 'REGISTERED']
    },
    is_author_visible: DataTypes.BOOLEAN, // is this message visible to the author?
})

/** Moderation
 * 
 * - new global settings to enable/disable this feature (enabled by default)
 * - every user could report an event
 * - admins will receive an mail notification about the report 
 * - admin could reply to report (optional adding author as destination)
 * - admin could always interact with event moderation (hide, confirm, remove)
 * - admin could disable the author
*/