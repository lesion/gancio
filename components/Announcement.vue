<template lang="pug">
  nuxt-link(:to='`/announcement/${announcement.id}`')
    v-alert.mb-1(border='left' type='info' color="primary" show-icon) {{announcement.title}}

</template>
<script>
import { mapState } from 'vuex'

export default {
  props: {
    announcement: { type: Object, default: () => ({}) }
  },
  computed: mapState(['announcements'])
}
</script>
