'use strict';

const { query } = require("../log");

module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.createTable('sites', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        hostname: {
          type: Sequelize.STRING,
          unique: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, { transaction })
      // await queryInterface.removeConstraint('settings', 'settings_pkey',{ transaction }); // myTable_pkey = name of constraint
      await queryInterface.sequelize.query('ALTER TABLE settings RENAME TO old_settings', { transaction })

      await queryInterface.createTable('settings', {
        key: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false,
          index: true
        },
        siteId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          index: true,
          defaultValue: null,
          references: {
            model: 'sites',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'          
        },        
        value: Sequelize.JSON,
        is_secret: Sequelize.BOOLEAN,
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }        
      }, { transaction })

      await queryInterface.sequelize.query('INSERT INTO sites (id, updatedAt, createdAt) values(0, date("now"), date("now"))', { transaction })
      await queryInterface.sequelize.query('INSERT INTO settings SELECT key, 0, value, is_secret, createdAt, updatedAt from old_settings', { transaction })
      // await queryInterface.changeColumn('settings', 'key', {
      //   type: Sequelize.STRING,
      //   allowNull: false,
      //   index: true,
      //   unique: false,
      //   primaryKey: false
      // }, { transaction })
      // await queryInterface.addColumn('settings', 'siteId', {
      //   type: Sequelize.INTEGER,
      //   references: {
      //     model: 'sites',
      //     key: 'id'
      //   },
      //   onUpdate: 'CASCADE',
      //   onDelete: 'CASCADE'
      // }, { transaction })
      // await queryInterface.addConstraint('settings', {
      //   type: 'primary key',
      //   name: 'custom_primary',
      //   fields: ['key', 'siteId']
      // })
      await queryInterface.addColumn('places', 'siteId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'sites',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }, { transaction })
      await queryInterface.addColumn('events', 'siteId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'sites',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }, { transaction })
      await queryInterface.addColumn('users', 'siteId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'sites',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }, { transaction })
      await queryInterface.addColumn('announcements', 'siteId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'sites',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }, { transaction })      
      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
      // return false
    }
  },
  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.dropTable('sites')
      await queryInterface.removeColumn('settings', 'siteId')
      await queryInterface.removeColumn('places', 'siteId')
      await queryInterface.removeColumn('events', 'siteId')
      await queryInterface.removeColumn('users', 'siteId')
      // await queryInterface.removeColumn('announcements', 'siteId')
      await transaction.commit()
    } catch (err) {
      console.error(err)
      await transaction.rollback()
      throw err
    }

  }
}