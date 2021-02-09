<template lang="pug">
  #calendar
    v-calendar(
      title-position='left'
      :is-dark="settings['theme.is_dark']"
      :columns="$screens({ sm: 2 }, 1)"
      @update:from-page='updatePage'
      :locale='$i18n.locale'
      :attributes='attributes'
      transition='fade'
      is-expanded
      is-inline
      @dayclick='click')

</template>
<script>
import { mapState, mapActions } from 'vuex'
import dayjs from 'dayjs'
import { take, get } from 'lodash'

export default {
  name: 'Calendar',
  props: {
    events: { type: Array, default: () => [] }
  },
  data () {
    const month = dayjs().month() + 1
    const year = dayjs().year()
    return {
      page: { month, year },
      attributes: []
    }
  },
  computed: mapState(['tags', 'filters', 'in_past', 'settings']),
  methods: {
    ...mapActions(['updateEvents', 'showPastEvents']),
    updateAttributes () {
      const colors = ['blue', 'orange', 'yellow', 'teal', 'indigo', 'green', 'red', 'purple', 'pink', 'gray']
      const tags = take(this.tags, 10).map(t => t.tag)
      let attributes = []
      attributes.push({ key: 'today', dates: new Date(), highlight: { color: 'green', fillMode: 'outline' } })

      function getColor (event) {
        const color = { class: 'vc-rounded-full', color: 'blue', fillMode: 'normal' }
        const tag = get(event, 'tags[0]')
        if (!tag) { return color }
        const idx = tags.indexOf(tag)
        if (idx < 0) { return color }
        color.color = colors[idx]
        return color
      }

      attributes = attributes.concat(this.events
        .filter(e => !e.multidate)
        .map(e => {
          return {
            key: e.id,
            dot: getColor(e),
            dates: new Date(e.start_datetime * 1000)
          }
        }))

      attributes = attributes.concat(this.events
        .filter(e => e.multidate)
        .map(e => ({
          key: e.id,
          highlight: getColor(e),
          dates: { start: new Date(e.start_datetime * 1000), end: new Date(e.end_datetime * 1000) }
        })))

      this.attributes = attributes
    },
    updatePage (page) {
      return new Promise((resolve, reject) => {
        this.$emit('monthchange', page)
        this.updateAttributes()
      })
    },
    click (day) {
      this.$emit('dayclick', day)
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
