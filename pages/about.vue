<template lang="pug">
  el-card
    nuxt-link.float-right(to='/')
      el-button(circle  icon='el-icon-close' type='danger' size='small' plain)    
    h3 {{$t('common.info')}}

    div(v-html='$t("about")')
    hr
    small Made with <a href='https://gancio.org'>Gancio {{settings.version}}</a>

</template>
<script>
import { mapState } from 'vuex'
export default {
  computed: mapState(['settings']),
  head () {
    return {
      title: `${this.settings.title} - ${this.$t('common.info')}`
    }
  }
}
</script>
