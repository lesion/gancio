<template lang="pug">
  v-card
    v-card-title {{$t('common.import')}}
    v-card-text
      p(v-html="$t('event.import_description')")
      v-form(v-model='valid' ref='form' lazy-validation @submit.prevent='importGeneric')
        v-row
          .col-xl-5.col-lg-5.col-md-7.col-sm-12.col-xs-12
            v-text-field(v-model='URL'
              :label="$t('common.url')"
              :hint="$t('event.import_URL')"
              persistent-hint
              :loading='loading' :error='error'
              :error-messages='errorMessage')
          .col
            v-file-input(
              v-model='file'
              accept=".ics"
              :label="$t('event.ics')"
              :hint="$t('event.import_ICS')"
              persistent-hint)

    v-card-actions
      v-spacer
      v-btn(text @click='$emit("close")' color='warning') {{$t('common.cancel')}}
      v-btn(text @click='importGeneric' :loading='loading' :disabled='loading'
        color='primary') {{$t('common.import')}}

</template>
<script>
import ical from 'ical.js'
import get from 'lodash/get'
import { mapState } from 'vuex'

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
    importICS () {
      const reader = new FileReader()
      reader.readAsText(this.file)
      reader.onload = () => {
        const ret = ical.parse(reader.result)
        const component = new ical.Component(ret)
        const events = component.getAllSubcomponents('vevent')
        const event = new ical.Event(events[0])
        this.event = {
          title: get(event, 'summary', ''),
          description: get(event, 'description', ''),
          place: { name: get(event, 'location', '') },
          start_datetime: get(event, 'startDate', '').toUnixTime(),
          end_datetime: get(event, 'endDate', '').toUnixTime()
        }

        this.$emit('imported', this.event)
      }
    },
    async importURL () {
      if (!this.URL) {
        this.errorMessage = this.$validators.required('common.url')('')
        this.error = true
        return
      }
      if (!this.URL.match(/^https?:\/\//)) {
        this.URL = `https://${this.URL}`
      }
      this.error = false
      this.errorMessage = ''
      this.loading = true

      try {
        const ret = await this.$axios.$get('/event/import', { params: { URL: this.URL } })
        this.events = ret
        // check if contain an h-event
        this.$emit('imported', ret[0])
      } catch (e) {
        this.error = true
        this.errorMessage = String(e)
      }

      this.loading = false
    }
  }
}
</script>
