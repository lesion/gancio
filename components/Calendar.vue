<template lang="pug">
  #calendar
    v-calendar(
      title-position='left'
      :locale='$i18n.locale'
      is-dark
      :attributes='attributes'
      :from-page.sync='page'
      is-expanded
      is-inline
      @dayclick='click')

</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import moment from 'dayjs'
import { intersection, sample, get } from 'lodash'

export default {
  name: 'Calendar',
  data () {
    const month = moment().month()+1
    const year = moment().year()
    return {
      page: { month, year},
    }
  },
  watch: {
    // month selected
    page () {
      this.updateEvents(this.page)
    }
  },
  methods: {
    ...mapActions(['updateEvents']),
    click (day) {
      const element = document.getElementById(day.day)
      if (element) element.scrollIntoView();   //Even IE6 supports this
    },
  },
  computed: {
    ...mapGetters(['filteredEvents']),
    attributes () {
      let attributes = []
      attributes.push ({ key: 'today', dates: new Date(), highlight: { color: 'green' }})

      attributes = attributes.concat(this.filteredEvents
        .filter(e => !e.multidate)
        .map(e => ({ key: e.id, dot: {}, dates: new Date(e.start_datetime*1000)})))

      attributes = attributes.concat(this.filteredEvents
        .filter(e => e.multidate)
        .map( e => ({ key: e.id, highlight: {}, dates: { 
          start: new Date(e.start_datetime*1000), end: new Date(e.end_datetime*1000) }})))
          
      return attributes
    }
  }
}
</script>

<style>
#calendar {
  margin: 0 auto;
  max-width: 500px;
  align-self: center;
}

.vc-opacity-0 {
  opacity: 0.2 !important;
}
/* .vc-highlight {
  color: red;
  height: 22px !important;
  opacity: 0.4;
  border-radius: 15px;
} */

</style>
