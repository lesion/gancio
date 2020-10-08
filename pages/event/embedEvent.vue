<template lang='pug'>
v-card(color='secondary')
  v-card-title(v-text="$t('common.embed_title')")
  v-card-text
    v-row(:gutter='10')
      v-col(:span='12' :xs='24')
        v-alert.mb-1.mt-1(type='info' show-icon) {{$t('common.embed_help')}}
        v-text-field(v-model='code')
      v-col.mt-2(:span='12' :xs='24' v-html='code')
  v-card-actions
    v-spacer
    v-btn(color='warning' @click="$emit('close')") {{$t("common.cancel")}}
    v-btn(v-clipboard:copy='code' v-clipboard:success='copyLink' color="primary") {{$t("common.copy")}}
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'EmbedEvent',
  props: ['event'],
  computed: {
    ...mapState(['settings']),
    code () {
      const style = "style='border: 0; width: 100%; height: 215px;'"
      const src = `${this.settings.baseurl}/embed/${this.event.id}`
      const code = `<iframe ${style} src="${src}"></iframe>`
      return code
    }
  },
  methods: {
    copyLink () {
      this.$root.$message('common.copied', { color: 'success' })
    }
  }
}
</script>
