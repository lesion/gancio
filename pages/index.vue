<template lang="pug">
  #home
    Nav
    Home

</template>
<script>
import Home from '~/components/Home.vue'
import Nav from '~/components/Nav.vue'

export default {
  name: 'Index',
  async fetch ({ store, $axios }) {
    try {
      const now = new Date()
      const events = await $axios.$get(`/event/${now.getMonth()}/${now.getFullYear()}`)
      store.commit('setEvents', events)
      const { tags, places } = await $axios.$get('/event/meta')
      store.commit('update', { tags, places })
    } catch (e) {
      console.error(e)
    }
  },
  components: { Nav, Home }
}
</script>
