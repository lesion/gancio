<template lang='pug'>
v-card
  v-card-title(v-text="$t('common.embed_title')")
  v-card-text
        v-alert.mb-3.mt-1(type='info' show-icon) {{$t('common.embed_help')}}
        v-alert.pa-5.my-4.blue-grey.darken-4.text-body-1.lime--text.text--lighten-3 {{code.script}}<br/>{{code.el}}<br/><br/>
          v-btn.float-end(text  color='primary'
            v-clipboard:copy='code'
            v-clipboard:success='copyLink') {{$t("common.copy")}}
            v-icon.ml-1 mdi-content-copy
        p.mx-auto
          .mx-auto
            gancio-event(:id='event.id' :baseurl='settings.baseurl')
  v-card-actions
    v-spacer
    v-btn(text color='warning' @click="$emit('close')") {{$t("common.cancel")}}
    v-btn(text v-clipboard:copy='code' v-clipboard:success='copyLink' color="primary") {{$t("common.copy")}}
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'EmbedEvent',
  props: {
    event: { type: Object, default: () => ({}) }
  },
  computed: {
    ...mapState(['settings']),
    code () {
      const script = `<script src='${this.settings.baseurl}/gancio-events.es.js'/>`
      const el = `<gancio-event id='${this.event.id}' baseurl='${this.settings.baseurl}'></gancio-event>`
      return { script, el }
    }
  },
  methods: {
    copyLink () {
      this.$root.$message('common.copied', { color: 'success' })
    }
  }
}
</script>
