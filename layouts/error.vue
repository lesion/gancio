<template lang='pug'>
  v-container.p-4.text-center
    v-alert(v-if="error.statusCode === 404" type='error' :icon='mdiAlert') ¯\_(ツ)_/¯ {{error.message}}
    v-alert(v-else type='error' :icon='mdiAlert') An error occurred: {{error.message}}
    nuxt-link(to='/')
      v-btn Back to home
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
