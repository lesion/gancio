<template lang="pug">
    v-calendar#calendar.card(
      title-position='left'
      locale='it'
      is-dark
      show-caps
      :attributes='attributes'
      :from-page.sync='page'
      is-expanded is-inline)
      div(slot='popover', slot-scope='{ customData, attributes }')
        p {{attributes}}
        //- router-link(:to="`/event/${customData.id}`") {{customData.start_datetime|hour}} - {{customData.title}}
        //- div(v-if='customData.days && customData.days[selectedEvent]')
          p {{customData.days[customData.selectedEvent].title}}
          p {{customData.days[customData.selectedEvent].tags}}
          el-button(@click='customData.selectedEvent=customData.selectedEvent+1') {{customData.selectedEvent}}/{{customData.days.length}} 
            v-icon(name='clock' @click='customData.selectedEvent=customData.selectedEvent+1')
        //- @{{customData.place.name}}
</template>
<script>
import { mapState, mapActions } from 'vuex'
import moment from 'dayjs'
import { intersection } from 'lodash'

export default {
  name: 'Calendar',
  // filters,
  data () {
    const month = moment().month()+1
    const year = moment().year()
    return {
      page: { month, year},
      selectedEvent: {},
      daysWithEvents: {}
    }
  },
  
  watch: {
    page () {
      this.updateEvents(this.page)
    }
  },
  methods: {
    ...mapActions(['updateEvents']),
    nextEvent () {

    },
    eventToAttribute(event) {
      let e = {
        key: event.id,
        customData: event,
        order: event.start_datetime,
      }
      const day = moment(event.start_datetime).date()
      if (!this.daysWithEvents[day]) {
        this.daysWithEvents[day] = []
        e.popover = {
          slot: 'popover',
          visibility: 'hover',
          isInteractive: true,
          hideIndicator: true,
        }
        e.customData.days = this.daysWithEvents[day]
      }
      this.daysWithEvents[day].push({title: event.title, when: event.start_datetime, tags: event.tags })

      let color = event.tags && event.tags.length && event.tags[0].color ? event.tags[0].color : 'rgba(170,170,250,0.7)'
      if (event.past) color = 'rgba(200,200,200,0.5)'
      if (event.multidate) {
        e.dates = {
          start: event.start_datetime, end: event.end_datetime
        }
        e.highlight = { backgroundColor: color,
          borderColor: 'transparent',
          borderWidth: '4px' }
      } else {
        e.dates = event.start_datetime
        e.dot = { backgroundColor: color, borderColor: color, borderWidth: '3px' }
      }
      return e
    }
  },
  computed: {
    filteredEvents () {
      return this.$store.getters.filteredEvents
    },
    ...mapState(['events', 'filters']),
    attributes () {
      return [
        { key: 'today', dates: new Date(),
          highlight: {
            backgroundColor: '#aaffaa'
          },
          popover: {label: this.$t('common.today')}
        }, 
        ...this.filteredEvents.map(this.eventToAttribute)
      ]
    }
  }
}
</script>

<style>
#calendar {
  margin-bottom: 0em;
  margin-top: 0.3em;
}

#calendar a { 
  color: blue;
}
</style>
