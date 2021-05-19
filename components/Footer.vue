<template lang="pug">
  v-footer(color='secondary')
    v-btn(color='primary' text href='https://gancio.org' target='_blank') Gancio <small>{{settings.version}}</small>
    v-btn(v-for='link in settings.footerLinks'
      :key='link.label' color='primary' text :to='link.href') {{link.label}}

    v-menu(v-if='settings.enable_trusted_instances && settings.trusted_instances && settings.trusted_instances.length'
      offset-y bottom open-on-hover transition="slide-y-transition")
      template(v-slot:activator="{ on, attrs }")
        v-btn(v-bind='attrs' v-on='on' color='primary' text) {{$t('common.places')}}
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

    //- v-btn(v-if='settings.enable_federation' text rel='me' @click.prevent='showFollowMe=true') follow me
    //- v-btn(nuxt to='/about' text) about
    //- v-btn(href='https://blog.gancio.org' text) blog
    //- v-btn(href='https://framagit.org/les/gancio' text) source
</template>
<script>
import { mapState } from 'vuex'

export default {
  computed: mapState(['settings'])
}
</script>
