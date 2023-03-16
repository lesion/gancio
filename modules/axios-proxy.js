const HttpsProxyAgent = require("https-proxy-agent"),
      axios = require("axios"),
      config = require('../server/config')

function axiosProxy (_moduleOptions) {

  if (config.proxy && !(!config.proxy.hostname && !config.proxy.host)) {
    const httpsAgent = new HttpsProxyAgent({
      protocol: config.proxy.protocol,
      hostname: config.proxy.hostname,
      host: config.proxy.host, 
      port: config.proxy.port, 
      auth: config.proxy.auth.username + ':' + config.proxy.auth.password,
      headers: config.proxy.headers 
    })

    // Use axios as you normally would, but specify httpsAgent in the default configs
    // https://github.com/nuxt-community/axios-module/pull/428#issuecomment-743313813
    // Nuxt 2: https://github.com/axios/axios/issues/925#issuecomment-513028175
    // Nuxt 3: https://github.com/unjs/ofetch#-adding-https-agent
    axios.defaults.httpsAgent = httpsAgent
  }

}

module.exports = axiosProxy