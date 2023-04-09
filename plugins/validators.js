const linkify = require('linkifyjs')

export default ({ app }, inject) => {
  const $t = app.i18n.t.bind(app.i18n)
  const validators = {
    required (fieldName) {
      return v => !(v===undefined || v===null || v.length <= 0) || $t('validators.required', { fieldName: $t(fieldName) })
    },
    email: [
      v => !!v || $t('validators.required', { fieldName: $t('common.email') }),
      v => (v && (v === 'admin' || !!linkify.test(v, 'email')) || $t('validators.email'))
    ],
    password: [
      v => !!v || $t('validators.required', { fieldName: $t('common.password') })
    ],
    latitude: [
      v => (v < 90 && v > -90) || $t('validators.latitude')
    ],
    longitude: [
      v => (v < 180 && v > -180) || $t('validators.longitude')
    ]
  }

  inject('validators', validators)
}
