<template lang="pug">
  div#nav
    nuxt-link#logo(to='/')
      img(src='/favicon.ico')
      span.ml-1.hidden-xs-only {{settings.title}}
        small.hidden-sm-only  {{settings.description}}

    el-menu#menu(mode='horizontal' router )
      el-menu-item(v-if='could_add' index='/add')
        i.el-icon-plus
        span.hidden-xs-only {{$t('common.add_event')}}

      //- nuxt-link(to='/export')
      el-menu-item(index='/export')
        i.el-icon-share
        span.hidden-xs-only {{$t('common.share')}}

      el-menu-item(v-if='!$auth.loggedIn' index='/login')
        i.el-icon-user
        span.hidden-xs-only {{$t('common.login')}}
      el-submenu(v-if='$auth.loggedIn' index=3)
        template(slot='title')
          i.el-icon-user
          span.hidden-xs-only {{$t('common.user')}}
        el-menu-item(divided index='/settings')
          i.el-icon-s-tools
          span {{$t('common.settings')}}
        el-menu-item(v-if='$auth.user.is_admin'  index='/admin')
          i.el-icon-s-operation
          span {{$t('common.admin')}}
        el-menu-item(@click='logout')
          i.el-icon-switch-button
          span  {{$t('common.logout')}}

      el-menu-item(type='text' v-clipboard:copy='`${settings.baseurl}/feed/rss`' v-clipboard:success='copyLink')
        v-icon(color='orange' name='rss')

</template>
<script>
import { Message } from 'element-ui'
import { mapState } from 'vuex'

export default {
  name: 'Nav',
  computed: {
    could_add () {
      return (this.$auth.loggedIn || this.settings.allow_anon_event)
    },
    ...mapState(['filters', 'settings'])
  },
  methods: {
    copyLink () {
      Message({ message: this.$t('common.feed_url_copied'), type: 'success', showClose: true })
    },
    logout () {
      Message({ showClose: true, message: this.$t('common.logout_ok'), type: 'success' })
      this.$auth.logout()
    }
  }
}
</script>

<style lang='less'>

#logo {
  img {
    max-height: 60px;
  }
  line-height: 60px;
  float: left;
  color: white;
  font-size: 1.5em;
  font-weight: 600;
  text-decoration: none;
  small {
    font-size: 0.5em;
  }
}

#menu {
  float: right;
  border-bottom: none;

  .el-menu-item {
    padding: 0px 15px;
  }
}

</style>
