<template lang='pug'>
  el-container#main(:class='{dark: $route.name==="index"}')
    el-backtop
    el-header#header
      Nav
    #content
      nuxt
    el-footer#footer
      .row
        .col.col-7
          small <a href='https://gancio.org'>Gancio {{settings.version}}</a>
        .col#links
          nuxt-link(to='/about') about
          a(href='https://gancio.org') docs
          a(href='https://blog.gancio.org') blog
          a(href='https://socialhub.activitypub.rocks/c/software/gancio/43') forum
          a(href='https://framagit.org/les/gancio') source

</template>
<script>
import Nav from '~/components/Nav.vue'
import { mapState } from 'vuex'
export default {
  components: { Nav },
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
