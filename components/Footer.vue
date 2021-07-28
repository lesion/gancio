<template lang="pug">
  v-footer(color='secondary' aria-label='Footer')

    v-dialog(v-model='showFollowMe' destroy-on-close max-width='700px')
      FollowMe(@close='showFollowMe=false' is-dialog)

    v-btn(color='primary' text href='https://gancio.org' target='_blank') Gancio <small>{{settings.version}}</small>
    v-btn.ml-1(v-for='link in footerLinks'
      :key='link.label' color='primary' text
      :href='link.href' :to='link.to' :target="link.href && '_blank'") {{link.label}}

    v-menu(v-if='settings.enable_trusted_instances && settings.trusted_instances && settings.trusted_instances.length'
      offset-y bottom open-on-hover transition="slide-y-transition")
      template(v-slot:activator="{ on, attrs }")
        v-btn.ml-1(v-bind='attrs' v-on='on' color='primary' text) {{$t('common.places')}}
      v-list(subheaders two-lines)
        v-list-item(v-for='instance in settings.trusted_instances'
          :key='instance.name'
          target='_blank'
          :href='instance.url'
          two-line)
          v-list-item-avatar
            v-img(:src='`${instance.url}/logo.png`')
          v-list-item-content
            v-list-item-title {{instance.name}}
            v-list-item-subtitle {{instance.label}}

    v-btn.ml-1(v-if='settings.enable_federation' color='primary' text rel='me' @click.prevent='showFollowMe=true') {{$t('event.interact_with_me')}}
</template>
<script>
import { mapState } from 'vuex'
import FollowMe from '../components/FollowMe'

export default {
  components: { FollowMe },
  data () {
    return {
      showFollowMe: false
    }
  },
  computed: {
    ...mapState(['settings']),
    footerLinks () {
      return this.settings.footerLinks.map(link => {
        if (/^https?:\/\//.test(link.href)) {
          return { href: link.href, label: link.label }
        } else {
          return { to: link.href, label: link.label }
        }
      })
    }
  }
}
</script>
