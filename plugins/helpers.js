const linkify = require('linkifyjs')
export const validators = {
  required (fieldName) {
    return value => !!value || `validators.required.${fieldName}`
  },
  email: [
    v => !!v || 'validators.required.email',
    v => (v && !!linkify.test(v, 'email')) || 'validators.valid.email'
  ],
  password: [
    v => !!v || 'validators.required.password'
  ]
}
