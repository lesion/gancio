<template lang="pug">
  v-app-bar(app)

    //- logo, title and description
    v-list-item(:to='$route.name==="index"?"/about":"/"')
      v-list-item-avatar(tile)
        v-img(src='/logo.png')
      v-list-item-content.d-none.d-sm-flex
        v-list-item-title
          h2 {{settings.title}}
        v-list-item-subtitle {{settings.description}}

    v-spacer

    v-tooltip(bottom) {{$t('common.add_event')}}
      template(v-slot:activator='{ on }')
        v-btn(v-if='could_add' icon nuxt to='/add' v-on='on' :aria-label='$t("common.add_event")')
          v-icon(large color='primary') mdi-plus

    v-tooltip(bottom) {{$t('common.share')}}
      template(v-slot:activator='{ on }')
        v-btn(icon nuxt to='/export' v-on='on' :aria-label='$t("common.share")')
          v-icon mdi-share-variant

    v-tooltip(v-if='!$auth.loggedIn' bottom) {{$t('common.login')}}
      template(v-slot:activator='{ on }')
        v-btn(icon nuxt to='/login' v-on='on' :aria-label='$t("common.login")')
          v-icon mdi-login

    v-menu(v-else
      offset-y bottom open-on-hover transition="slide-y-transition")
      template(v-slot:activator="{ on, attrs }")
        v-btn(icon v-bind='attrs' v-on='on' aria-label='Menu')
          v-icon mdi-dots-vertical
      v-list
        v-list-item(nuxt to='/settings')
          v-list-item-icon
            v-icon mdi-cog
          v-list-item-content
            v-list-item-title {{$t('common.settings')}}

        v-list-item(v-if='$auth.user.is_admin' nuxt to='/admin')
          v-list-item-icon
            v-icon mdi-account
          v-list-item-content
            v-list-item-title {{$t('common.admin')}}

        v-list-item(@click='logout')
          v-list-item-icon
            v-icon mdi-logout
          v-list-item-content
            v-list-item-title {{$t('common.logout')}}

    v-menu(offset-y bottom open-on-hover transition="slide-y-transition" dense)
      template(v-slot:activator="{ on, attrs }")
        v-btn(icon v-bind='attrs' v-on='on' aria-label='Language') {{locale}}
      v-list
        v-list-item(v-for='(v, k) in locales' :key='k' @click='changeLocale(k)')
          v-list-item-content
            v-list-item-title {{v}} {{k}}
        v-list-item(nuxt target='_blank' href='https://hosted.weblate.org/engage/gancio/')
          v-list-item-content
            v-list-item-title(v-text='$t("common.help_translate")')

    v-btn(icon v-clipboard:copy='feedLink' v-clipboard:success='copyLink' aria-label='RSS')
      v-icon(color='orange') mdi-rss

</template>
<script>
import { mapState, mapActions } from 'vuex'
import locales from '../locales/esm.js'

export default {
  name: 'Nav',
  computed: {
    ...mapState(['filters', 'settings', 'locale']),
    locales () {
      return locales
    },
    feedLink () {
      const tags = this.filters.tags && this.filters.tags.join(',')
      const places = this.filters.places && this.filters.places.join(',')
      let query = ''
      if (tags || places) {
        query = '?'
        if (tags) {
          query += 'tags=' + tags
          if (places) { query += '&places=' + places }
        } else {
          query += 'places=' + places
        }
      }

      return `${this.settings.baseurl}/feed/rss${query}`
    },
    could_add () {
      return (this.$auth.loggedIn || this.settings.allow_anon_event)
    }
  },
  methods: {
    ...mapActions(['setLocale']),
    changeLocale (k) {
      this.setLocale(k)
      this.$i18n.locale = k
    },
    copyLink () {
      this.$root.$message('common.feed_url_copied')
    },
    logout () {
      this.$root.$message('common.logout_ok')
      this.$auth.logout()
    }
  }
}
</script>
