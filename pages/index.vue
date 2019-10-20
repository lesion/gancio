<template lang='pug'>
  #home
    Nav
    Home

</template>
<script>
import Home from '~/components/Home.vue'
import Nav from '~/components/Nav.vue'
import moment from 'moment-timezone'
import { mapState } from 'vuex'

export default {
  name: 'Index',
  computed: mapState(['settings']),
  mounted (ctx) {
    moment.tz.setDefault(this.settings.instance_timezone)
  },
  async fetch ({ store, $axios }) {
    try { 
      moment.tz.setDefault(store.state.settings.instance_timezone)
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
