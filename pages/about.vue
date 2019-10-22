<template lang="pug">
  el-main
    h4 <nuxt-link to='/'><img src='/favicon.ico'/></nuxt-link> {{$t('common.info')}}

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
