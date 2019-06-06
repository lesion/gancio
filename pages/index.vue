<template lang="pug">
  #home
    Nav
    Home
    

</template>
<script>
import Home from '~/components/Home.vue'
import Nav from '~/components/Nav.vue'
import { mapState } from 'vuex'

export default {
  name: 'Index',
  async asyncData ({ redirect, store }) {
    // console.error('diocane', store.state.settings)
    // const firstRun = store.state.settings.firstRun
    // if (firstRun!==true) {
    //   redirect('/firstrun')
    // }
  },
  async fetch ({ store, $axios }) {
    const now = new Date()
    const events = await $axios.$get(`/event/${now.getMonth()}/${now.getFullYear()}`)
    console.error(events)
    store.commit('setEvents', events)
    const { tags, places } = await $axios.$get('/event/meta')
    store.commit('update', { tags, places })
    // const settings = await $axios.$get('/settings')
    // store.commit('setSettings', settings)
  },
  computed: mapState(['events']),
  components: { Nav, Home },
}
</script>

