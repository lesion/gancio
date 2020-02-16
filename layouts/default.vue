<template lang='pug'>
  el-container#main(:class='{dark: $route.name==="index" || $route.name==="announcement-id"}')
    el-dialog(:visible.sync='showFollowMe')
      h4(slot='title') {{$t('common.follow_me_title')}}
      FollowMe

    el-backtop
    el-header#header
      Nav
    #content
      nuxt
    el-footer.mt-1#footer
      #links
        a(href='https://gancio.org') Gancio {{settings.version}}</a>
        span  ⇒
        a(v-if='settings.enable_federation' rel='me' :href='settings.baseurl' @click.prevent='showFollowMe=true') follow me
        nuxt-link(to='/about') about
        a(href='https://blog.gancio.org') blog
        a(href='https://framagit.org/les/gancio') source

</template>
<script>
import Nav from '~/components/Nav.vue'
import { mapState } from 'vuex'
import FollowMe from '../components/FollowMe'

export default {
  components: { Nav, FollowMe },
  data () {
    return { showFollowMe: false }
  },
  computed: mapState(['settings'])
}
</script>
<style lang='less'>
#footer {
  a {
    font-size: 1.1em;
    &:hover {
      border-bottom: 1px solid yellow;
    }
  }
}
</style>
