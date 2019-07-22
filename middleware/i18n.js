export default function ({ req, app, store }) {
  if (process.server) {
    const lang = req.acceptsLanguages('en', 'it')
    store.commit('setLocale', lang || 'it')  
    app.i18n.locale = store.state.locale
  }
}
