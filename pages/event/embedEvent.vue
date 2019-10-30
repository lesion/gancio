<template lang='pug'>
el-row
  el-col(:span='12')
    el-input(v-model='code')
  el-col(:span='12' v-html='code')
</template>
<script>
import { mapState } from 'vuex'

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
  }
}
</script>
