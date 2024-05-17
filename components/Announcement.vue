<template>
  <nuxt-link :to='`/announcement/${announcement.id}`'>
    <v-alert rounded="0" flat  color="primary" border="left" show-icon :icon='mdiInformation'><h3>{{announcement.title}}</h3></v-alert>
  </nuxt-link>
</template>
<script>
import { mdiInformation } from '@mdi/js'

export default {
  data () {
    return { mdiInformation }
  },
  props: {
    announcement: { type: Object, default: () => ({}) }
  }
}
</script>
