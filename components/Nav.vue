<template lang="pug">
v-app-bar(app aria-label='Menu' height=64)

  //- logo, title and description
  v-list-item(:to='$route.name==="index"?"/about":"/"')
    v-list-item-avatar.ma-xs-1(tile)
      img(src='/logo.png' height='40')
    v-list-item-content
      v-list-item-title.d-flex
        h2 {{settings.title}}
      v-list-item-subtitle.d-none.d-sm-flex {{settings.description}}

  v-spacer
  v-btn(v-if='$auth.loggedIn || settings.allow_anon_event' icon nuxt to='/add' :aria-label='$t("common.add_event")' :title='$t("common.add_event")')
    v-icon(large color='primary' v-text='mdiPlus')

  v-btn(icon nuxt to='/export' :title='$t("common.share")' :aria-label='$t("common.share")')
    v-icon(v-text='mdiShareVariant')

  v-btn(v-if='!$auth.loggedIn' icon nuxt to='/login' :title='$t("common.login")' :aria-label='$t("common.login")')
    v-icon(v-text='mdiLogin')

  client-only
    v-menu(v-if='$auth.loggedIn' offset-y eager)
      template(v-slot:activator="{ on, attrs }")
        v-btn(icon v-bind='attrs' v-on='on' title='Menu' aria-label='Menu')
          v-icon(v-text='mdiDotsVertical')
      v-list
        v-list-item(nuxt to='/settings')
          v-list-item-icon
            v-icon(v-text='mdiCog')
          v-list-item-content
            v-list-item-title {{$t('common.settings')}}

        v-list-item(v-if='$auth.user.is_admin' nuxt to='/admin')
          v-list-item-icon
            v-icon(v-text='mdiAccount')
          v-list-item-content
            v-list-item-title {{$t('common.admin')}}

        v-list-item(@click='logout')
          v-list-item-icon
            v-icon(v-text='mdiLogout')
          v-list-item-content
            v-list-item-title {{$t('common.logout')}}
    template(#placeholder)
      v-btn(v-if='$auth.loggedIn' icon aria-label='Menu' title='Menu')
        v-icon(v-text='mdiDotsVertical')


  v-btn(icon target='_blank' :href='`${settings.baseurl}/feed/rss`' title='RSS' aria-label='RSS')
    v-icon(color='orange' v-text='mdiRss')

</template>
<script>
import { mapState } from 'vuex'
import clipboard from '../assets/clipboard'
import { mdiPlus, mdiShareVariant, mdiLogin, mdiDotsVertical, mdiLogout, mdiAccount, mdiCog, mdiRss } from '@mdi/js'


export default {
  name: 'Nav',
  data () {
    return { mdiPlus, mdiShareVariant, mdiLogout, mdiLogin, mdiDotsVertical, mdiAccount, mdiCog, mdiRss }
  },
  mixins: [clipboard],
  computed: mapState(['settings']),
  methods: {
    logout () {
      this.$root.$message('common.logout_ok')
      this.$auth.logout()
    }
  }
}
</script>
