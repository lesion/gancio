const path = require('path')
const fs = require('fs')
const log = require('../../log')
const config = require('../../config')

const pluginController = {
  plugins: [],
  getAll(req, res, next) {
    res.json(pluginController.plugins)
  },

  togglePlugin(req, res, next) {
    const plugin = req.params.plugin
    if (this.plugins[plugin].enable) {

    }

  },

  unloadPlugin(plugin) {
    log.info('Unload plugin ' + plugin)
  },

  loadPlugin(pluginName) {
    const plugin = this.plugins[pluginName]
    if (!plugin) {
      log.warn(`Plugin ${pluginName} not found`)
      return
    }
    if (typeof plugin.onEventCreate === 'function') {
      notifier.emitter.on('Create', plugin.onEventCreate)
    }
    if (typeof plugin.onEventDelete === 'function') {
      notifier.emitter.on('Delete', plugin.onEventDelete)
    }
    if (typeof plugin.onEventUpdate === 'function') {
      notifier.emitter.on('Update', plugin.onEventUpdate)
    }

    plugin.load({ settings: settingsController.settings }, settingsController.settings.plugins)
  },

  _load() {
    const settingsController = require('./settings')
    // load custom plugins
    const plugins_path = config.plugins_path || path.resolve(process.env.cwd || '', 'gancio_plugins')
    log.info(`Loading plugin  ${plugins_path}`)
    if (fs.existsSync(plugins_path)) {
      const notifier = require('../../notifier')
      const plugins = fs.readdirSync(plugins_path)
        .map(e => path.resolve(plugins_path, e, 'index.js'))
        .filter(index => fs.existsSync(index))
      plugins.forEach(pluginFile => {
        try {
          const plugin = require(pluginFile)
          if (typeof plugin.load !== 'function') return
          const name = plugin.configuration.name
          console.log(`Found plugin '${name}'`)
          pluginController.plugins.push(plugin.configuration)
          if (settingsController.settings['plugin_' + name]) {
            const pluginSetting = settingsController.settings['plugin_' + name]
            if (pluginSetting.enable) {
              plugin.load({ settings: settingsController.settings }, settingsController.settings.plugins)
              if (typeof plugin.onEventCreate === 'function') {
                notifier.emitter.on('Create', plugin.onEventCreate)
              }
              if (typeof plugin.onEventDelete === 'function') {
                notifier.emitter.on('Delete', plugin.onEventDelete)
              }
              if (typeof plugin.onEventUpdate === 'function') {
                notifier.emitter.on('Update', plugin.onEventUpdate)
              }
            }
          } else {
            settingsController.set('plugin_' + name, { enable: false })
          }
        } catch (e) {
          log.warn(`Unable to load plugin ${pluginFile}: ${String(e)}`)
        }
      })
    }
  }
}

module.exports = pluginController
