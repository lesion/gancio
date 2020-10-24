<template lang='pug'>
  v-container.p-4.text-center
    v-alert(v-if="error.statusCode === 404") ¯\_(ツ)_/¯ {{error.message}}
    v-alert(v-else type='error') <v-icon>mdi-warning</v-icon> An error occurred: {{error.message}}
    nuxt-link(to='/') Back to home
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: { error: { type: Object, default: () => ({ }) } },
  head () {
    return { title: `${this.settings.title} - Error` }
  },
  computed: mapState(['settings'])
}
</script>
