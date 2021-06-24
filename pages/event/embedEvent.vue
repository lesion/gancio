<template lang='pug'>
v-card
  v-card-title(v-text="$t('common.embed_title')")
  v-card-text
    v-row
      v-col.col-12
        v-alert.mb-1.mt-1(type='info' show-icon) {{$t('common.embed_help')}}
        v-text-field(v-model='code')
          v-btn(slot='prepend' text color='primary'
            v-clipboard:copy='code'
            v-clipboard:success='copyLink') {{$t("common.copy")}}
            v-icon.ml-1 mdi-content-copy

      v-col.mt-2(v-html='code')
  v-card-actions
    v-spacer
    v-btn(color='warning' @click="$emit('close')") {{$t("common.cancel")}}
    v-btn(v-clipboard:copy='code' v-clipboard:success='copyLink' color="primary") {{$t("common.copy")}}
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
      const style = "style='border: 0; width: 100%; height: 215px;'"
      const src = `${this.settings.baseurl}/embed/${this.event.slug || this.event.id}`
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
