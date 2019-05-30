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
    const show_tags = req.query.showtags
    const tags = req.query.tags
    const places = req.query.places
    const now = new Date()

    // TODO: filter future events based on tags/places/userid
    const events = await $axios.$get(`/event/${now.getMonth()}/${now.getFullYear()}`)

    return { show_tags, events, title }
  },
}
</script>
