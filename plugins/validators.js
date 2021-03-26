const linkify = require('linkifyjs')

export default ({ app }, inject) => {
  const $t = app.i18n.t.bind(app.i18n)
  const validators = {
    required (fieldName) {
      return value => !!value || $t('validators.required', { fieldName: $t(fieldName) })
    },
    email: [
      v => !!v || $t('validators.required', { fieldName: $t('common.email') }),
      v => (v && !!linkify.test(v, 'email')) || $t('validators.email')
    ],
    password: [
      v => !!v || $t('validators.required', { fieldName: $t('common.password') })
    ]
  }

  inject('validators', validators)
}
