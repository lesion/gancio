<template lang="pug">
  List(:events="events" :title='title')
</template>
<script>
import { mapState } from 'vuex'
import { SHARED_CONF } from '../../config'
import List from '../../components/List'
import moment from 'dayjs'

export default {
  layout: 'iframe',
  components: { List },
  async asyncData ({ $axios, req, res }) {
    const title = req.query.title || SHARED_CONF.title
    const tags = req.query.tags
    const places = req.query.places
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
