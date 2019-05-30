<template lang="pug">
  #calendar
    v-calendar(
      title-position='left'
      locale='it'
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
      let color = event.past ? 'rgba(200,200,200,0.5)' : get(event, 'tags[0].color') || 'rgba(170,170,250,0.7)'

      console.error(color)
      if (event.multidate) {
        e.dates = {
          start: event.start_datetime, end: event.end_datetime
        }
        e.highlight = { 
          color: 'red' // : sample(['purple', 'red', 'green', 'blue']),
        }
      } else {
        e.dates = event.start_datetime
        e.dot = { color: 'rgba(102,10,20)' }
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

.vc-highlight {
  /* color: red; */
  height: 22px !important;
  opacity: 0.4;
  border-radius: 15px;
}

</style>
