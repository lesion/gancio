<template lang="pug">
  #calendar
    v-calendar(
      title-position='left'
      :is-dark="settings['theme.is_dark']"
      @update:from-page='updatePage'
      :locale='$i18n.locale'
      :attributes='attributes'
      transition='fade'
      is-expanded
      is-inline
      @dayclick='click')

</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import dayjs from 'dayjs'
import { take, get } from 'lodash'

export default {
  name: 'Calendar',
  data () {
    const month = dayjs().month() + 1
    const year = dayjs().year()
    return {
      page: { month, year }
    }
  },
  computed: {
    ...mapGetters(['filteredEventsWithPast']),
    ...mapState(['tags', 'filters', 'in_past', 'settings']),

    // TODO: could be better
    attributes () {
      const colors = ['green', 'orange', 'yellow', 'teal', 'indigo', 'blue', 'red', 'purple', 'pink', 'gray']
      const tags = take(this.tags, 10).map(t => t.tag)
      let attributes = []
      attributes.push({ key: 'today', dates: new Date(), highlight: { color: 'green' } })

      const that = this
      function getColor (event) {
        const color = { class: event.past && !that.filters.show_past_events && !that.in_past ? 'past-event vc-rounded-full' : 'vc-rounded-full', color: 'blue' }
        const tag = get(event, 'tags[0]')
        if (!tag) { return color }
        const idx = tags.indexOf(tag)
        if (idx < 0) { return color }
        color.color = colors[idx]
        return color
      }

      attributes = attributes.concat(this.filteredEventsWithPast
        .filter(e => !e.multidate)
        .map(e => {
          return {
            key: e.id,
            dot: getColor(e),
            dates: new Date(e.start_datetime * 1000)
          }
        }))

      attributes = attributes.concat(this.filteredEventsWithPast
        .filter(e => e.multidate)
        .map(e => ({
          key: e.id,
          highlight: getColor(e),
          dates: { start: new Date(e.start_datetime * 1000), end: new Date(e.end_datetime * 1000) }
        })))

      return attributes
    }
  },
  methods: {
    ...mapActions(['updateEvents', 'showPastEvents']),
    updatePage (page) {
      this.updateEvents(page)
    },
    click (day) {
      const element = document.getElementById(day.day)
      if (element) { element.scrollIntoView() } // Even IE6 supports this
    }
  }
}
</script>

<style>
.vc-opacity-0 {
  opacity: 0.3 !important;
}

.past-event {
  opacity: 0.3;
}
</style>
