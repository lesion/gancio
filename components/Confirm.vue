
<template lang="pug">
  v-dialog(v-model='show'
    :color='options.color'
    :title='title'
    :max-width='options.width'
    :style="{ zIndex: options.zIndex, position: 'absolute' }"
    @keydown.esc='cancel')
    v-card
      v-card-title {{ title }}
      v-card-text(v-show='!!message') {{ message }}
      v-card-actions
        v-spacer
        v-btn(color='error' @click='cancel') {{$t('common.cancel')}}
        v-btn(color='primary' @click='agree') {{$t('common.ok')}}
</template>

<script>
/**
 * Vuetify Confirm Dialog component
 *
 * Call it:
 * this.$refs.confirm.open('Delete', 'Are you sure?', { color: 'red' }).then((confirm) => {})
 *
 * Or use await:
 * if (await this.$refs.confirm.open('Delete', 'Are you sure?', { color: 'red' })) {
 *   // yes
 * }
 * else {
 *   // cancel
 * }
 *
 */
export default {
  data: () => ({
    dialog: false,
    resolve: null,
    reject: null,
    message: null,
    title: null,
    options: {
      color: 'danger',
      width: 450,
      zIndex: 500
    }
  }),
  computed: {
    show: {
      get () {
        return this.dialog
      },
      set (value) {
        this.dialog = value
        if (value === false) {
          this.cancel()
        }
      }
    }
  },
  created () {
    this.$root.$confirm = this.open
  },
  methods: {
    open (message, options = {}) {
      this.dialog = true
      this.title = options.title || this.$t('common.confirm')
      this.message = this.$t(message, options)
      this.options = Object.assign(this.options, options)
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    agree () {
      this.resolve(true)
      this.dialog = false
    },
    cancel () {
      this.resolve(false)
      this.dialog = false
    }
  }
}
</script>
