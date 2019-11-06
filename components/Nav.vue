<template lang="pug">
  el-menu.d-flex.nav(mode='horizontal' background-color="#222C32")
    Login(:show='showLogin', @close='showLogin=false')
    Register(:show='showRegister', @close='showRegister=false')
    nuxt-link(to='/about')
      el-menu-item(:title="$t('common.info')")
        img#logo(src='/favicon.ico')

    nuxt-link(v-if='!$auth.loggedIn' to='/?ref=login')
      el-menu-item(:title="$t('common.login')")
        v-icon(color='lightgreen' name='user')

    nuxt-link(v-if='could_add' to='/add')
      el-menu-item(:title="$t('common.add_event')")
        v-icon(color='lightgreen' name='plus')

    el-popover(placement="bottom" trigger="click")
      Search(past-filter recurrent-filter)
      el-menu-item(slot='reference' :title="$t('common.search')" icon='el-share-button')
        v-icon(color='lightblue' name='search')
        el-badge(v-if='filters.tags.length+filters.places.length>0' is-dot type='warning')

    nuxt-link(v-if='$auth.loggedIn' to='/settings')
      el-menu-item(:title="$t('common.settings')")
        v-icon(color='orange' name='cog')

    nuxt-link(v-if='$auth.user && $auth.user.is_admin'  to='/admin')
      el-menu-item(:title="$t('common.admin')")
        v-icon(color='lightblue' name='tools')

    nuxt-link(to='/export')
      el-menu-item(:title="$t('common.share')")
        v-icon(name='share' color='yellow')

      el-menu-item(v-if='$auth.loggedIn' @click='logout' :title="$t('common.logout')")
        v-icon(color='red' name='sign-out-alt')

    el-menu-item(:title="$t('common.feed')" v-clipboard:copy='`settings.baseurl/feed/rss`' v-clipboard:success='copyLink')
        v-icon(color='orange' name='rss')

</template>
<script>
import { Message } from 'element-ui'
import { mapState } from 'vuex'
import Search from '@/components/Search'
import Login from '@/components/Login'
import Register from '@/components/Register'

export default {
  name: 'Nav',
  components: { Search, Login, Register },
  data () {
    return {
      showLogin: this.$route.query.ref === 'login',
      showRegister: this.$route.query.ref === 'register'
    }
  },
  computed: {
    could_add () {
      return (this.$auth.loggedIn || this.settings.allow_anon_event)
    },
    ...mapState(['filters', 'settings'])
  },
  watch: {
    '$route.query.ref' (value) {
      if (value === 'register') {
        this.showRegister = true
        this.showLogin = false
      } else if (value === 'login') {
        this.showLogin = true
        this.showRegister = false
      }
    }
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

<style>

.el-menu.el-menu--horizontal {
  border-bottom: none;
}

#logo {
  height: 30px;
}
</style>
