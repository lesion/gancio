<template lang="pug">
    v-calendar#calendar.card(
      :attributes='attributes'
      :from-page.sync='page'
      is-expanded is-inline)
      div(slot='popover', slot-scope='{ customData }')
        router-link(:to="`/event/${customData.id}`") {{customData.start_datetime|hour}} - {{customData.title}} @{{customData.place.name}}
</template>
<script>
import { mapState, mapActions } from 'vuex'
import filters from '@/filters'
import moment from 'moment'
import { intersection } from 'lodash'

export default {
  name: 'Calendar',
  filters,
  data () {
    const month = moment().month()+1
    const year = moment().year()
    return {
      page: { month, year},
    }
  },
  mounted () {
    this.updateEvents(this.page)
  },
  watch: {
    page () {
      this.updateEvents(this.page)
    }
  },
  methods: {
    ...mapActions(['updateEvents']),
    eventToAttribute(event) {
      let e = {
        key: event.id,
        customData: event,
        order: event.start_datetime,
        popover: {
          slot: 'popover',
          visibility: 'hover'
        }
      }
      
      let color = event.tags.length && event.tags[0].color ? event.tags[0].color : 'rgba(200,200,200,0.5)'
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
    ...mapState(['events', 'filters', 'user', 'logged']),
    attributes () {
      return [
        { key: 'todaly', dates: new Date(),
          highlight: {
            backgroundColor: '#aaffaa'
          },
          popover: {label: this.$t('Today')}
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
</style>
