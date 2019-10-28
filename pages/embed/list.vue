<template lang="pug">
  List(:events="events" :title='title')
</template>
<script>
import List from '../../components/List'

export default {
  layout: 'iframe',
  components: { List },
  data () {
    return {
      title: ''
    }
  },
  async asyncData ({ query, $axios }) {
    const title = query.title
    const tags = query.tags
    const places = query.places

    let params = []
    if (places) { params.push(`places=${places}`) }
    if (tags) { params.push(`tags=${tags}`) }

    params = params.length ? `?${params.join('&')}` : ''
    const events = await $axios.$get(`/export/json${params}`)

    return { events, title }
  }
}
</script>
