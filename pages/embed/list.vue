<template lang="pug">
  div
    p porcodio
</template>
<script>
import { mapState } from 'vuex'
// import List from '../../components/List'
import moment from 'dayjs'

export default {
  name: 'diocane',
  layout: 'iframe',
  // components: { List },
  async asyncData ({ $axios, req, res }) {
    const show_tags = req.query.showtags
    const tags = req.query.tags
    const places = req.query.places
    const events = await $axios.$get('/export/json')
    return { events, show_tags }
  },
}
</script>
