<template lang='pug'>
  Home
</template>
<script>
import Home from '~/components/Home.vue'
import Nav from '~/components/Nav.vue'
import moment from 'moment-timezone'
import { mapState } from 'vuex'

export default {
  name: 'Index',
  components: { Nav, Home },
  fetch ({ store }) {
    moment.tz.setDefault(store.state.settings.instance_timezone)
  },
  computed: mapState(['settings']),
  mounted (ctx) {
    moment.tz.setDefault(this.settings.instance_timezone)
  }
}
</script>
