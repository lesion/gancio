const path = require('path')
const fs = require('fs')
const log = require('../../log')
const config = require('../../config')
const settingsController = require('./settings')
const notifier = require('../../notifier')

const pluginController = {
  plugins: [],
  getAll(_req, res) {
    // return plugins and inner settings
    const plugins = pluginController.plugins.map( ({ configuration }) => {
      if (settingsController.settings['plugin_' + configuration.name]) {
        configuration.settingsValue = settingsController.settings['plugin_' + configuration.name]
      }
      return configuration
    })
    return res.json(plugins)
  },

  togglePlugin(req, res) {
    const pluginName = req.params.plugin
    const pluginSettings = settingsController.settings['plugin_' + pluginName]
    if (!pluginSettings) { return res.sendStatus(404) }
    if (!pluginSettings.enable) {
      pluginController.loadPlugin(pluginName)
    } else {
      pluginController.unloadPlugin(pluginName)
    }
    settingsController.set('plugin_' + pluginName,
      { ...pluginSettings, enable: !pluginSettings.enable })
    res.json()
  },

  unloadPlugin(pluginName) {
    const plugin = pluginController.plugins.find(p => p.configuration.name === pluginName)
    const settings = settingsController.settings['plugin_' + pluginName]
    if (!plugin) {
      log.warn(`Plugin ${pluginName} not found`)
      return
    }
    const notifier = require('../../notifier')
    log.info('Unload plugin ' + plugin)
    if (typeof plugin.onEventCreate === 'function') {
      notifier.emitter.off('Create', plugin.onEventCreate)
    }
    if (typeof plugin.onEventDelete === 'function') {
      notifier.emitter.off('Delete', plugin.onEventDelete)
    }
    if (typeof plugin.onEventUpdate === 'function') {
      notifier.emitter.off('Update', plugin.onEventUpdate)
    }

    if (plugin.unload && typeof plugin.unload === 'function') {
      plugin.unload({ settings: settingsController.settings }, settings)
    }

  },

  loadPlugin(pluginName) {
    const plugin = pluginController.plugins.find(p => p.configuration.name === pluginName)
    const settings = settingsController.settings['plugin_' + pluginName]
    if (!plugin) {
      log.warn(`Plugin ${pluginName} not found`)
      return
    }
    log.info('Load plugin ' + pluginName)
    if (typeof plugin.onEventCreate === 'function') {
      notifier.emitter.on('Create', plugin.onEventCreate)
    }
    if (typeof plugin.onEventDelete === 'function') {
      notifier.emitter.on('Delete', plugin.onEventDelete)
    }
    if (typeof plugin.onEventUpdate === 'function') {
      notifier.emitter.on('Update', plugin.onEventUpdate)
    }

    if (plugin.load && typeof plugin.load === 'function') {
      plugin.load({
        helpers: require('../../helpers'),
        settings: settingsController.settings
      },
      settings)
    }
  },

  _loadPlugin (pluginFile) {
    try {
      const plugin = require(pluginFile)
      const name = plugin.configuration.name
      console.log(`Found plugin '${name}'`)
      pluginController.plugins.push(plugin)
      if (settingsController.settings['plugin_' + name]) {
        const pluginSetting = settingsController.settings['plugin_' + name]
        if (pluginSetting.enable) {
          pluginController.loadPlugin(name)
        }
      } else {
        settingsController.set('plugin_' + name, { enable: false })
      }
    } catch (e) {
      log.warn(`Unable to load plugin ${pluginFile}: ${String(e)}`)
    }    
  },

  _load() {
    // load custom plugins
    const system_plugins_path = path.resolve(__dirname || '', '../../../gancio_plugins')
    const custom_plugins_path = config.plugins_path || path.resolve(process.env.cwd || '', 'plugins')
    const plugins_paths = custom_plugins_path === system_plugins_path ? [custom_plugins_path] : [custom_plugins_path, system_plugins_path]

    log.info(`Loading plugins from ${plugins_paths.join(' and ')}`)
    for (const plugins_path of plugins_paths) {
      if (fs.existsSync(plugins_path)) {
        fs.readdirSync(plugins_path)
          .map(e => path.resolve(plugins_path, e, 'index.js'))
          .filter(index => fs.existsSync(index))
          .forEach(pluginController._loadPlugin)
      }
    }
  }
}

module.exports = pluginController
