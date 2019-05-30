<template lang="pug">
  section

    a(href='#totop')
      el-button.top.d-block.d-sm-none(icon='el-icon-top' circle type='primary' plain)
    a.totop(name='totop')
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

export default {
  name: 'Home',
  data () {
    return { }
  },
  components: { Calendar, Event },
  computed: mapGetters(['filteredEvents']),
}
</script>
<style lang="less">
section {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;

  .top {
    position: fixed;
    bottom: 10px;
    right: 10px;
    z-index: 1;
    opacity: 0.7;
    font-size: 16px;
  }

  .totop {
    position: absolute;
    top: 0px;
  }
}
</style>
