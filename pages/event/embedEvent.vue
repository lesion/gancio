<template lang='pug'>
el-row(:gutter='10')
  el-col(:span='12' :xs='24')
    el-alert.mb-1.mt-1(type='info' show-icon) {{$t('common.embed_help')}}
    el-input(v-model='code')
      el-button(slot='append' v-clipboard:copy='code' v-clipboard:success='copyLink'
        plain type="primary" icon='el-icon-document') {{$t("common.copy")}}
  el-col.mt-2(:span='12' :xs='24' v-html='code')
</template>
<script>
import { mapState } from 'vuex'
import { Message } from 'element-ui'

export default {
  name: 'embedEvent',
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
      Message({ message: this.$t('common.copied'), type: 'success' })
    }
  }
}
</script>
