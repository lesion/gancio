<template lang='pug'>
v-card
  v-card-title(v-text="$t('common.embed_title')")
  v-card-text
        v-alert.mb-3.mt-1(type='info' show-icon :icon='mdiInformation') {{$t('common.embed_help')}}
        v-alert.pa-5.my-4.blue-grey.darken-4.text-body-1.lime--text.text--lighten-3 <pre>{{code}}</pre>
          v-btn.float-end(text  color='primary' @click='clipboard(code)') {{$t("common.copy")}}
            v-icon.ml-1(v-text='mdiContentCopy')
        p.mx-auto
          .mx-auto
            gancio-event(:id='event.id' :baseurl='settings.baseurl')
  v-card-actions
    v-spacer
    v-btn(text color='warning' @click="$emit('close')") {{$t("common.cancel")}}
    v-btn(text @click='clipboard(code)' color="primary") {{$t("common.copy")}}
</template>
<script>
import { mapState } from 'vuex'
import clipboard from '../assets/clipboard'
import { mdiContentCopy, mdiInformation } from '@mdi/js'

export default {
  name: 'EmbedEvent',
  data() {
    return { mdiContentCopy, mdiInformation }
  },
  mixins: [clipboard],
  props: {
    event: { type: Object, default: () => ({}) }
  },
  computed: {
    ...mapState(['settings']),
    code () {
      return `<script src='${this.settings.baseurl}\/gancio-events.es.js'><\/script>\n<gancio-event baseurl='${this.settings.baseurl}' id=${this.event.id}></gancio-event>\n\n`
    }
  }
}
</script>
