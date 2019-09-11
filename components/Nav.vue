<template lang="pug">
  el-menu.d-flex.nav(mode='horizontal' background-color="#222C32")

    nuxt-link(to='/about')
      el-menu-item(:title="$t('common.info')")
        img#logo(src='/favicon.ico')

    nuxt-link(to='/login')
      el-menu-item(v-if='!$auth.loggedIn' :title="$t('common.login')")
        v-icon(color='lightgreen' name='user')

    nuxt-link(v-if='could_add' to='/add')
      el-menu-item(:title="$t('common.add_event')")
        v-icon(color='lightgreen' name='plus')

    el-popover(
      placement="bottom"
      trigger="click")
      Search(past-filter recurrent-filter)
      el-menu-item(slot='reference' :title="$t('common.search')" icon='el-share-button')
        v-icon(color='lightblue' name='search')
        el-badge(v-if='filters.tags.length+filters.places.length>0' is-dot type='warning')

    nuxt-link(to='/settings')
      el-menu-item(v-if='$auth.loggedIn' :title="$t('common.settings')")
        v-icon(color='orange' name='cog')

    nuxt-link(to='/admin')
      el-menu-item(v-if='$auth.user && $auth.user.is_admin' :title="$t('common.admin')")
        v-icon(color='lightblue' name='tools')

    nuxt-link(to='/export')
      el-menu-item(:title="$t('common.share')")
        v-icon(name='share' color='yellow')

    nuxt-link(to='#')
      el-menu-item(v-if='$auth.loggedIn' @click='logout' :title="$t('common.logout')")
        v-icon(color='red' name='sign-out-alt')

</template>
<script>
import { Message } from 'element-ui'
import { mapState } from 'vuex'
import Search from '@/components/Search'

export default {
  name: 'Nav',
  components: { Search },
  computed: {
    could_add () {
      return (this.$auth.loggedIn || this.settings.allow_anon_event)
    },
    ...mapState(['filters', 'settings'])
  },
  methods: {
    logout () {
      Message({
        showClose: true,
        message: this.$t('common.logout_ok'),
        type: 'success'
      })
      this.$auth.logout()
    }
  }
}
</script>

<style>

.el-menu.el-menu--horizontal {
  border-bottom: none;
}

</style>
