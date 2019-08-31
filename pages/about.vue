<template lang="pug">
  el-card

    nuxt-link.float-right(to='/')
      v-icon(name='times' color='red')
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
