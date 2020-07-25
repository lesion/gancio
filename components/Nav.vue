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

    v-tooltip(bottom) {{$t('common.add')}}
      template(v-slot:activator='{ on }')
        v-btn(v-if='could_add' icon nuxt to='/add' v-on='on')
          v-icon mdi-calendar-plus

    v-tooltip(bottom) {{$t('common.share')}}
      template(v-slot:activator='{ on }')
        v-btn(icon nuxt to='/export' v-on='on')
          v-icon mdi-share-variant

    v-menu(v-if='settings.enable_trusted_instances && settings.trusted_instances && settings.trusted_instances.length'
      offset-y bottom open-on-hover transition="slide-y-transition")
      template(v-slot:activator="{ on, attrs }")
        v-btn(icon v-bind='attrs' v-on='on')
          v-icon mdi-map-marker-path
      v-list
        v-list-item(v-for='instance in settings.trusted_instances'
          :key='instance.name'
          :href='instance.url'
          two-line)
          v-list-item-avatar
            v-img(:src='`${instance.url}/favicon.ico`')
          v-list-item-content
            v-list-item-title {{instance.name}}
            v-list-item-subtitle {{instance.label}}

    v-btn(v-if='!$auth.loggedIn' icon nuxt to='/login')
      v-icon mdi-login

    v-menu(v-else
      offset-y bottom open-on-hover transition="slide-y-transition")
      template(v-slot:activator="{ on, attrs }")
        v-btn(icon v-bind='attrs' v-on='on')
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

    v-btn(icon v-clipboard:copy='feedLink' v-clipboard:success='copyLink')
      v-icon(color='orange') mdi-rss

  //-     el-menu-item(type='text' v-clipboard:copy='feedLink' v-clipboard:success='copyLink')
  //-       v-icon(color='orange' name='rss')

  //- el-header#header
  //-     img(src='/favicon.ico')
  //-     span.ml-1.hidden-xs-only {{settings.title}}
  //-       small.hidden-sm-only  {{settings.description}}

  //-   el-menu#menu(mode='horizontal' router )
  //-     el-menu-item(v-if='could_add' index='/add')
  //-       i.el-icon-plus
  //-       span.hidden-xs-only {{$t('common.add_event')}}

  //-     //- nuxt-link(to='/export')
  //-     el-menu-item(index='/export')
  //-       i.el-icon-share
  //-       span.hidden-xs-only {{$t('common.share')}}

  //-     el-submenu(v-if='settings.enable_trusted_instances && settings.trusted_instances && settings.trusted_instances.length' index=4)
  //-       template(slot='title')
  //-         i.el-icon-guide
  //-         span.hidden-xs-only {{$t('common.places')}}
  //-       el-menu-item(v-for='instance in settings.trusted_instances' :key='instance.name')
  //-         a(:href='instance.url' target='_link')
  //-           img.mr-1(:src='`${instance.url}/favicon.ico`' style='height: 25px;')
  //-           span.ml-1 {{instance.label || instance.name}}

  //-     el-menu-item(v-if='!$auth.loggedIn' index='/login')
  //-       i.el-icon-user
  //-       span.hidden-xs-only {{$t('common.login')}}

  //-     el-submenu(v-if='$auth.loggedIn' index=3)
  //-       template(slot='title')
  //-         i.el-icon-user
  //-         span.hidden-xs-only {{$t('common.user')}}
  //-       el-menu-item(divided index='/settings')
  //-         i.el-icon-s-tools
  //-         span {{$t('common.settings')}}
  //-       el-menu-item(v-if='$auth.user.is_admin'  index='/admin')
  //-         i.el-icon-s-operation
  //-         span {{$t('common.admin')}}
  //-       el-menu-item(@click='logout')
  //-         i.el-icon-switch-button
  //-         span  {{$t('common.logout')}}

  //-     el-menu-item(type='text' v-clipboard:copy='feedLink' v-clipboard:success='copyLink')
  //-       v-icon(color='orange' name='rss')

</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'Nav',
  computed: {
    ...mapState(['filters', 'settings']),
    feedLink () {
      const tags = this.filters.tags.join(',')
      const places = this.filters.places.join(',')
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
    copyLink () {
      this.$root.$emit('message', {
        message: this.$t('common.feed_url_copied')
      })
    },
    logout () {
      this.$root.$emit('message', {
        message: this.$t('common.logout_ok')
      })
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
        console.error(e)
        Message({
          showClose: true,
          type: 'error',
          message: e
        })
      }
    }
  }
}
</script>

<style lang='less'>
// #header {
//   display: inline;
//   #logo {
//     img {
//       max-height: 60px;
//     }
//     float: left;
//     line-height: 60px;
//     color: white;
//     font-size: 1.5em;
//     font-weight: 600;
//     text-decoration: none;
//     small {
//       font-size: 0.5em;
//     }
//   }

//   #menu {
//     position: absolute;
//     right: 10px;
//     top: 0px;
//     border-bottom: none;
//     .el-menu-item {
//       padding: 0px 15px;
//     }
//   }
// }

</style>
