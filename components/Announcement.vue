<template lang="pug">
  nuxt-link(:to='`/announcement/${announcement.id}`')
    v-alert.mb-1(border='left' type='info' color="primary" :icon='mdiInformation') {{announcement.title}}

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
