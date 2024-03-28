
<template lang="pug">
v-dialog(v-model='show'
  :fullscreen='$vuetify.breakpoint.xsOnly'
  :color='options.color'
  :title='title'
  :max-width='options.width'
  :style="{ zIndex: options.zIndex, position: 'absolute' }"
  @keydown.esc='cancel')
  v-card
    v-card-title {{ title }}
    v-card-text(v-show='!!message')
      span(v-html='message')
      v-textarea(v-if='options.is_prompt' v-model='prompt')
    v-card-actions
      v-spacer
      v-btn(outlined color='error' @click='cancel') {{$t('common.cancel')}}
      v-btn(outlined color='primary' @click='agree' :disabled="options.is_prompt && !prompt") {{$t('common.ok')}}
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
    prompt: '',
    options: {
      is_prompt: false,
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
    this.$root.$prompt = this.openPrompt
  },
  methods: {
    openPrompt (message, options ) {
      return this.open(message, { ...options, is_prompt: true })
    },
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
      this.resolve(this.options.is_prompt ? this.prompt : true)
      this.prompt = ''
      this.dialog = false
    },
    cancel () {
      this.resolve(false)
      this.prompt = ''
      this.dialog = false
    }
  }
}
</script>
