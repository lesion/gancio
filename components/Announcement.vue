<template>
  <nuxt-link :to='`/announcement/${announcement.id}`'>
    <v-alert class='mb-1' border='left' type='info' color="primary" :icon='mdiInformation'>{{announcement.title}}</v-alert>
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
