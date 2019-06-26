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
import { intersection, sample, take, get } from 'lodash'

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
    ...mapGetters(['filteredEventsWithPast']),
    ...mapState(['tags', 'filters']),
    attributes () {
      const colors = ['indigo', 'orange', 'yellow', 'green', 'teal', 'blue', 'red', 'purple', 'pink', 'grey']
      const tags = take(this.tags, 10).map(t=>t.tag)
      // const tags = [this.tags[0].tag, this.tags[1].tag, this.tags[2].tag, this.tags[3].tag, this.tags[4].tag, this.tags[5].tag ]
      let attributes = []
      attributes.push ({ key: 'today', dates: new Date(), highlight: { color: 'green' }})

      const that = this
      function getColor(event) {
        const color = { class: event.past && !that.filters.show_past_events ? 'past-event vc-rounded-full' : 'vc-rounded-full', color: 'blue' }
        const tag = get(event, 'tags[0].tag')
        if (!tag) return color
        const idx = tags.indexOf(tag)
        if (idx<0) return color
        color.color = colors[idx]
        return color
      }

      attributes = attributes.concat(this.filteredEventsWithPast
        .filter(e => !e.multidate)
        .map(e => ({
          key: e.id, 
          dot: getColor(e),
          dates: new Date(e.start_datetime*1000)})))

      attributes = attributes.concat(this.filteredEventsWithPast
        .filter(e => e.multidate)
        .map( e => ({ key: e.id, highlight: getColor(e), dates: { 
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

.past-event {
  opacity: 0.2;
}
</style>
