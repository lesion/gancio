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
    transition='fade'
    aria-label='Calendar'
    is-expanded
    is-inline)

</template>
<script>
import { mapState } from 'vuex'
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
    ...mapState(['settings']),
    attributes () {
      return attributesFromEvents(this.events)
    }
  },
  methods: {
    updatePage (page) {
      if (page.month !== this.page.month || page.year !== this.page.year) {
        this.$emit('monthchange', page)
        this.page.month = page.month
        this.page.year = page.year
      }
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
