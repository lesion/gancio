<template lang="pug">
  el-menu.d-grid.nav(mode='horizontal' router background-color="#222C32")

    nuxt-link(to='/login')
      el-menu-item(v-if='!$auth.loggedIn' index='/login' :title="$t('common.login')")
        v-icon(color='lightgreen' name='user')

    el-menu-item(index='/add' :title="$t('common.add_event')")
      v-icon(color='lightgreen' name='plus')

    el-menu-item(v-if='$auth.loggedIn' index='/settings' :title="$t('common.settings')")
      v-icon(color='orange' name='cog')

    el-menu-item(v-if='$auth.user && $auth.user.is_admin' index='/admin' :title="$t('common.admin')")
      v-icon(color='lightblue' name='tools')

    el-menu-item(index='/export' :title="$t('common.share')")
      v-icon(name='share' color='yellow')

    el-menu-item(v-if='$auth.loggedIn' @click='logout' :title="$t('common.logout')")
      v-icon(color='red' name='sign-out-alt')

    el-popover(
      placement="bottom"
      trigger="click")
      Search
      el-menu-item(slot='reference')
        v-icon(color='lightblue' name='search')

    el-menu-item.float-right(index='/about' :title="$t('common.info')")
      img#logo(src='/favicon.ico')


</template>
<script>
import { Message } from 'element-ui'
import Search from '@/components/Search'

export default {
  name: 'Nav',
  components: { Search },
  methods: {
    logout () {
      Message({
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
