<template lang="pug">
  v-card(color='secondary')
    v-card-title {{$t('event.importURL')}}
    v-card-text
      v-form(v-model='valid' ref='form' lazy-validation)
        v-text-field(v-model='URL' :loading='loading' :error='error' :error-messages='errorMessage')

      p {{event}}
    v-card-actions
      v-spacer
      v-btn(@click='$emit("close")' color='warning') {{$t('common.cancel')}}
      v-btn(@click='importURL' :loading='loading' :disabled='loading'
        color='primary') {{$t('common.import')}}


</template>
<script>
export default {
  name: 'ImportDialog',
  data () {
    return {
      errorMessage: '',
      error: false,
      loading: false,
      valid: false,
      URL: '',
      event: {}
    }
  },
  methods: {
    async importURL() {
      if (!this.URL) {
        this.errorMessage = this.$validators.required('common.URL')('')
        this.error = true
        return
      }
      this.error = false
      this.errorMessage = ''
      this.loading = true

      try {
        const ret = await this.$axios.$get('/event/import', { params: { URL: this.URL }})
        this.event = ret
        // check if contain an h-event
        this.$emit('imported', ret)
        console.error(ret)
      } catch (e) {
        console.error(e)
        this.error = true
        this.errorMessage = String(e)
      }

      this.loading = false
    }
  }
}
</script>