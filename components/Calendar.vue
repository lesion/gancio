<template lang="pug">
  client-only
    vc-date-picker(
      ref='cal'
      v-model='selectedDate'
      title-position='left'
      :is-dark="is_dark"
      :columns="!$vuetify.breakpoint.smAndDown ? 2 : 1"
      @input='click'
      @update:from-page='updatePage'
      :locale='$i18n.locale'
      :attributes='attributes'
      transition='fade'
      aria-label='Calendar'
      is-expanded
      is-inline)
    .calh.text-center(slot='placeholder')
      v-progress-circular.mt-5(indeterminate color='primary')

  </template>

</template>
<script>
import { mapState, mapGetters } from 'vuex'
import { mdiChevronDown, mdiClose } from '@mdi/js'

export default {
  name: 'Calendar',
  data ({$time}) {
    const month = $time.currentMonth()
    const year = $time.currentYear()
    return {
      mdiChevronDown, mdiClose,
      selectedDate: null,
      page: { month, year },
    }
  },
  computed: {
    ...mapState(['settings', 'events']),
    ...mapGetters(['is_dark']),
    attributes () {
      return this.$time.attributesFromEvents(this.events)
    }
  },
  methods: {
    updatePage (page) {
      if (page.month !== this.page.month || page.year !== this.page.year) {
        this.page.month = page.month
        this.page.year = page.year
        this.$root.$emit('monthchange', page)
      }
    },
    click (day) {
      this.$root.$emit('dayclick', day)
    }
  }
}
</script>

<style>
.vc-container.vc-is-dark {
  --gray-900: #111;
  --gray-700: #333;
}

.vc-container {
  --gray-400: #999 !important;
  --rounded-lg: 4px !important;
}

.vc-opacity-0 {
  opacity: 0.3 !important;
}

.past-event {
  opacity: 0.3;
}

#calendarButton {
  margin-top: -6px;
  margin-left: -10px;
}
</style>
