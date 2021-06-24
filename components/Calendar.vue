<template lang="pug">
  #calendar
    vc-calendar(
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
import { attributesFromEvents } from '../assets/helper'

export default {
  name: 'Calendar',
  props: {
    events: { type: Array, default: () => [] }
  },
  data () {
    const month = dayjs().month() + 1
    const year = dayjs().year()
    return {
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
      return new Promise((resolve, reject) => {
        this.$emit('monthchange', page)
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
