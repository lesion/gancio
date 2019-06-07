<template lang="pug">
  List(:events="events" :title='title')
</template>
<script>
import { mapState } from 'vuex'
import List from '../../components/List'
import moment from 'dayjs'

export default {
  layout: 'iframe',
  components: { List },
  computed: mapState(['config']),
  async asyncData ({ $axios, req, res }) {
    const title = req && req.query && req.query.title || this.config.title
    const tags = req && req.query && req.query.tags
    const places = req && req.query && req.query.places
    const now = new Date()

    let params = []
    if (places) params.push(`places=${places}`)
    if (tags) params.push(`tags=${tags}`)

    params = params.length ? `?${params.join('&')}` : ''
    const events = await $axios.$get(`/export/json${params}`)

    return { events, title }
  },
}
</script>
