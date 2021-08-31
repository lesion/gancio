<template lang="pug">
  List(:events="events" :title='title')
</template>
<script>
import List from '../../components/List'

export default {
  components: { List },
  layout: 'iframe',
  async asyncData ({ query, $axios }) {
    const title = query.title
    const tags = query.tags
    const places = query.places
    const show_recurrent = !!query.show_recurrent

    let params = []
    if (places) { params.push(`places=${places}`) }
    if (tags) { params.push(`tags=${tags}`) }
    if (show_recurrent) { params.push('show_recurrent=1') }

    params = params.length ? `?${params.join('&')}` : ''
    const events = await $axios.$get(`/export/json${params}`)

    return { events, title }
  }
}
</script>
