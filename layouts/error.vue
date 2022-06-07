<template lang='pug'>
v-container.pa-2.text-center
  v-alert(v-if="error.statusCode === 404" type='error' :icon='mdiAlert') ¯\_(ツ)_/¯ {{error.message}}
  v-alert.mb-2(v-else type='error' :icon='mdiAlert') An error occurred: {{error.message}}
  nuxt-link(to='/')
    v-btn(outlined color='primary') Back to home
</template>

<script>
import { mapState } from 'vuex'
import { mdiAlert } from '@mdi/js'
export default {
  props: { error: { type: Object, default: () => ({ }) } },
  data () {
    return { mdiAlert }
  },
  head () {
    return { title: `${this.settings.title} - Error` }
  },
  computed: mapState(['settings'])
}
</script>
