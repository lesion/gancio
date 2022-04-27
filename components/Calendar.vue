<template lang="pug">
  #calendar
    vc-date-picker(
      v-model='selectedDate'
      title-position='left'
      :is-dark="settings['theme.is_dark']"
      :columns="$screens({ sm: 2 }, 1)"
      @input='click'
      @update:from-page='updatePage'
      :locale='$i18n.locale'
      :attributes='attributes'
      :timezone='settings.instance_timezone'
      transition='fade'
      aria-label='Calendar'
      is-expanded
      is-inline)

</template>
<script>
import { mapState, mapActions } from 'vuex'
import dayjs from 'dayjs'
import { attributesFromEvents } from '../assets/helper'

export default {
  name: 'Calendar',
  props: {
    events: { type: Array, default: () => [] }
  },
  data () {
    const month = dayjs.tz().month() + 1
    const year = dayjs.tz().year()
    return {
      selectedDate: null,
      page: { month, year }
    }
  },
  computed: {
    ...mapState(['tags', 'filters', 'in_past', 'settings']),
    attributes () {
      return attributesFromEvents(this.events, this.tags)
    }
  },
  methods: {
    ...mapActions(['updateEvents', 'showPastEvents']),
    updatePage (page) {
        this.$emit('monthchange', page)
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
