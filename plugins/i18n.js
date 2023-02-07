export default async ({ app, $vuetify }) => {

  $vuetify.lang.current = app.i18n.locale

  app.i18n.onLanguageSwitched = (oldLocale, newLocale) => {
    $vuetify.lang.current = newLocale
  }
}