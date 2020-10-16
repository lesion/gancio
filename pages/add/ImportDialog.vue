<template lang="pug">
  v-card(color='secondary')
    v-card-title {{$t('common.import')}}
    v-card-text
      v-form(v-model='valid' ref='form' lazy-validation)
        v-text-field(v-model='URL'
          :label="$t('common.url')"
          :hint="$t('event.import_URL')"
          persistent-hint
          :loading='loading' :error='error'
          :error-messages='errorMessage')

        v-file-input(
          v-model='file'
          accept=".ics"
          :label="$t('common.ics')"
          :hint="$t('event.import_ICS')"
          persistent-hint
        )

      p {{event}}
    v-card-actions
      v-spacer
      v-btn(@click='$emit("close")' color='warning') {{$t('common.cancel')}}
      v-btn(@click='importGeneric' :loading='loading' :disabled='loading'
        color='primary') {{$t('common.import')}}


</template>
<script>
import ical from 'ical.js'

export default {
  name: 'ImportDialog',
  data () {
    return {
      file: null,
      errorMessage: '',
      error: false,
      loading: false,
      valid: false,
      URL: '',
      event: {}
    }
  },
  methods: {
    importGeneric () {
      if (this.file) {
        this.importICS()
      } else {
        this.importURL()
      }
    },
    async importICS() { 
      const reader = new FileReader()
      reader.readAsText(this.file)
      reader.onload = () => {
        const data = reader.result
        const event = ical.parse(data)
        this.event = {
          title: event.name 
        }
      }      
    },
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