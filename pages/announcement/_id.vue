<template lang="pug">
v-container
  v-card
    v-card-title.text-h4.font-weight-bold {{announcement.title}}
    v-card-text(v-html='announcement.announcement')
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'Announcement',
  async asyncData ({ params, error, $axios }) {
    try {
      const announcement_id = Number(params.id)
      const announcement = await $axios.$get(`/announcements/${announcement_id}`)
      if (!announcement) {
        error({ statusCode: 404, message: 'Announcement not found' })
      }
      return { announcement }
    } catch (e) {
      console.error(e)
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
      htmlAttrs: {
        lang: this.settings.instance_locale
      },
      title: `${this.settings.title} - ${this.announcement.title}`
    }
  },
  computed: mapState(['announcements', 'settings'])
}
</script>
