<template lang="pug">
  section

    .row.m-0
      no-ssr
        Calendar.col-sm-12.col-lg-8.col-xl-6
      .p-0.col-sm-6.col-lg-4.col-xl-3(v-for='event in filteredEvents')
        a(:id='event.newDay' v-if='event.newDay')
          .d-block.d-sm-none
            el-divider {{event.start_datetime|day}}
        Event(
          :id='event.start_datetime'
          :key='event.id'
          :event='event'
        )

</template>

<script>
import { mapGetters } from 'vuex'
import Event from '@/components/Event'
import Calendar from '@/components/Calendar'
import Search from '@/components/Search'

export default {
  name: 'Home',
  data () {
    return { }
  },
  components: { Calendar, Event, Search },
  computed: mapGetters(['filteredEvents']),
}
</script>
<style lang="less">
section {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
}
</style>
