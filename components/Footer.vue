<template lang="pug">
v-footer(aria-label='Footer')

  v-dialog(v-model='showFollowMe' destroy-on-close max-width='700px' :fullscreen='$vuetify.breakpoint.xsOnly')
    FollowMe(@close='showFollowMe=false' is-dialog)

  v-btn.ml-1(v-for='link in footerLinks'
    :key='link.label' color='primary' text
    :href='link.href' :to='link.to' :target="link.href && '_blank'") {{link.label}}

  v-menu(v-if='settings.enable_trusted_instances && trusted_instances?.length'
    offset-y bottom open-on-hover transition="slide-y-transition")
    template(v-slot:activator="{ on, attrs }")
      v-btn.ml-1(v-bind='attrs' v-on='on' color='primary' text) {{ settings.trusted_instances_label || $t('admin.trusted_instances_label_default')}}
    v-list(subheaders two-lines)
      v-list-item(v-for='instance in trusted_instances'
        :key='instance.name'
        target='_blank'
        :href='instance.ap_id'
        two-line)
        //- p {{ instance.object }}
        v-list-item-avatar
          v-img(:src='instance?.object?.icon?.url ?? `${instance.url}/favicon.ico`')
        v-list-item-content
          v-list-item-title {{instance?.label || instance?.object?.name || instance?.object?.preferredUsername }}

  v-btn.ml-1(v-if='settings.enable_federation' color='primary' text rel='me' @click.prevent='showFollowMe=true') {{$t('event.interact_with_me')}}
  v-spacer
  v-btn(color='primary' text href='https://gancio.org' target='_blank' rel="noopener") Gancio <small>{{settings.version}}</small>

</template>
<script>
import { mapState } from 'vuex'
import FollowMe from '../components/FollowMe'

export default {
  components: { FollowMe },
  data () {
    return {
      showFollowMe: false,
      trusted_instances: []
    }
  },
  created () {
    this.$root.$on('update_friendly_instances', this.$fetch)
  },
  async fetch () {
    this.trusted_instances = await this.$axios.$get('/instances/friendly')
  },
  computed: {
    ...mapState(['settings']),
    footerLinks () {
      if (!this.settings || !this.settings.footerLinks) return []
      return this.settings.footerLinks.map(link => {
        if (/^https?:\/\//.test(link.href)) {
          return { href: link.href, label: link.label.startsWith('common.') ? this.$t(link.label) : link.label }
        } else {
          return { to: link.href, label: link.label.startsWith('common.') ? this.$t(link.label) : link.label }
        }
      })
    }
  }
}
</script>
