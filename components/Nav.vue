<template lang="pug">
  v-app-bar(app aria-label='Menu')

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

    v-btn(icon @click='clipboard(feedLink, "common.feed_url_copied")' aria-label='RSS')
      v-icon(color='orange') mdi-rss

</template>
<script>
import { mapState } from 'vuex'
import clipboard from '../assets/clipboard'

export default {
  name: 'Nav',
  mixins: [clipboard],
  computed: {
    ...mapState(['filters', 'settings']),
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
    logout () {
      this.$root.$message('common.logout_ok')
      this.$auth.logout()
    },
    async createTrustedInstance () {
      let url = this.instance_url
      if (!url.match(/^https?:\/\//)) {
        url = `https://${url}`
      }
      try {
        const instance = await this.$axios.$get(`${url}/.well-known/nodeinfo/2.0`)
        const trusted_instance = {
          url,
          name: instance.metadata.nodeName,
          description: instance.metadata.nodeDescription,
          place: instance.metadata.placeDescription
        }
        this.setSetting({ key: 'trusted_instances', value: this.settings.trusted_instances.concat(trusted_instance) })
      } catch (e) {
        this.$root.$message(e, { color: 'error' })
      }
    }
  }
}
</script>
