<template lang='pug'>
  v-app(app)
    Snackbar
    Nav
    v-main(app)
      v-scroll-x-transition(hide-on-leave)
        nuxt

    Footer

  //- el-container#main(:class='{dark: $route.name==="index" || $route.name==="announcement-id"}')
    el-dialog(:visible.sync='showFollowMe')
      h4(slot='title') {{$t('common.follow_me_title')}}
      FollowMe

    el-backtop
    Nav
    #content
      nuxt
    el-footer.mt-1#footer
      #links

</template>
<script>
import Nav from '~/components/Nav.vue'
import FollowMe from '../components/FollowMe'
import Snackbar from '../components/Snackbar'
import Footer from '../components/Footer'

export default {
  name: 'Default',
  components: { Nav, FollowMe, Snackbar, Footer },
  data () {
    return { showFollowMe: false }
  },
  watch: {
    '$route.name' (name) {
      this.$vuetify.theme.dark = name !== 'NewEvent'
    }
  }
}
</script>
