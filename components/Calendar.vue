<template lang="pug">
  #calendar
    v-calendar(
      title-position='left'
      locale='it'
      is-dark
      :attributes='attributes'
      :from-page.sync='page'
      is-expanded
      show-clear-margin
      is-inline
      @dayclick='click')

</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import moment from 'dayjs'
import { intersection } from 'lodash'

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
    eventToAttribute(event) {
      let e = {
        key: event.id,
        customData: event,
        order: event.start_datetime,
      }
      const day = moment(event.start_datetime).date()
      let color = event.tags && event.tags.length && event.tags[0].color ? event.tags[0].color : 'rgba(170,170,250,0.7)'
      if (event.past) color = 'rgba(200,200,200,0.5)'
      if (event.multidate) {
        e.dates = {
          start: event.start_datetime, end: event.end_datetime
        }
        e.highlight = { backgroundColor: color,
          // borderColor: 'transparent',
          borderWidth: '4px' }
      } else {
        e.dates = event.start_datetime
        e.dot = { backgroundColor: color, borderColor: color, borderWidth: '3px' }
      }
      return e
    }
  },
  computed: {
    ...mapGetters(['filteredEvents']),
    attributes () {
      return [
        { key: 'today', dates: new Date(),
          highlight: {
            backgroundColor: '#aaffaa'
          },
        }, 
        ...this.filteredEvents.map(this.eventToAttribute)
      ]
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

</style>
