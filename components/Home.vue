<template lang="pug">
  section

    a(href='#totop')
      el-button.top.d-block.d-sm-none(icon='el-icon-top' circle type='primary' plain)
    a.totop(name='totop')
    //- el-backtop(target='#home')
    no-ssr
      Calendar
    .row.m-0

      .p-0.col-sm-6.col-lg-4.col-xl-3(v-for='event in filteredEvents')
        a(:id='event.newDay' v-if='event.newDay')
          .d-block.d-sm-none
            el-divider {{event.start_datetime|day}}
        //- p(style='color: white;') {{event}}
        Event(
          :id='event.start_datetime'
          :key='event.id'
          :event='event'
        )

</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Event from '@/components/Event'
import Calendar from '@/components/Calendar'

export default {
  name: 'Home',
  head () {
    return {
      title: this.settings.title,
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        { hid: 'description', name: 'description', content: this.settings.description },
        { hid: 'og-description', name: 'og:description', content: this.settings.description },
        { hid: 'og-title', property: 'og:title', content: this.settings.title },   
        { hid: 'og-url', property: 'og:url', content: this.settings.baseurl },   
        { property: 'og:image', content: this.settings.baseurl + '/favicon.ico' }
      ]
    }
  },
  data () {
    return { }
  },
  components: { Calendar, Event },
  computed: {
    ...mapGetters(['filteredEvents']),
    ...mapState(['events', 'settings'])
  }
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
