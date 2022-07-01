<template lang="pug">
v-container
  v-card
    v-card-title {{announcement.title}}
    v-card-text(v-html='announcement.announcement')
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'Announcement',
  asyncData ({ params, error, store }) {
    try {
      const id = Number(params.id)
      const announcement = store.state.announcements.find(a => a.id === id)
      if (!announcement) {
        error({ statusCode: 404, message: 'Announcement not found' })
      }
      return { announcement }
    } catch (e) {
      error({ statusCode: 404, message: 'Announcement not found' })
    }
  },
  data () {
    return { announcement: { title: '' } }
  },
  head () {
    if (!this.announcement) {
      return {}
    }
    return {
      title: `${this.settings.title} - ${this.announcement.title}`
    }
  },
  computed: mapState(['announcements', 'settings'])
}
</script>
