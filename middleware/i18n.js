import acceptLanguage from 'accept-language'
export default function ({ req, app, store }) {
  if (process.server) {
    const acceptedLanguages = req.headers['accept-language']
    const supportedLanguages = ['en', 'it', 'es']
    acceptLanguage.languages(supportedLanguages)
    const lang = acceptLanguage.get(acceptedLanguages)
    store.commit('setLocale', lang || 'it')
    app.i18n.locale = store.state.locale
  }
}
