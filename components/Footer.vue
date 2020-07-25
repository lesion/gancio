<template lang="pug">
  v-footer(app absolute)
    v-btn(text href='https://gancio.org') Gancio {{settings.version}}
    v-btn(v-if='settings.enable_federation' text rel='me' @click.prevent='showFollowMe=true') follow me
    v-btn(nuxt to='/about' text) about
    v-btn(href='https://blog.gancio.org' text) blog
    v-btn(href='https://framagit.org/les/gancio' text) source
</template>
<script>
import { mapState } from 'vuex'

export default {
  computed: mapState(['settings'])
}
</script>
