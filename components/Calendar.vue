<template lang="pug">
  client-only
    vc-date-picker(
      ref='cal'
      v-model='selectedDate'
      title-position='left'
      :is-dark="settings['theme.is_dark']"
      :columns="!$vuetify.breakpoint.smAndDown ? 2 : 1"
      @input='click'
      @update:from-page='updatePage'
      :locale='$i18n.locale'
      :popover="{ visibility: 'click' }"
      :attributes='attributes'
      transition='fade'
      aria-label='Calendar'
      is-expanded
      is-inline)
      //- template(v-slot="{ inputValue, inputEvents }")
        v-btn#calendarButton(v-on='inputEvents' text tile :color='selectedDate ? "primary" : "" ') {{inputValue || $t('common.calendar')}} 
          v-icon(v-if='selectedDate' v-text='mdiClose' right small icon @click.prevent.stop='selectedDate = null')
          v-icon(v-else v-text='mdiChevronDown' right small icon)
    .calh.d-flex.justify-center.align-center(slot='placeholder')
      v-progress-circular(indeterminate)
    //-   v-btn#calendarButton(text tile) {{$t('common.calendar')}} 
    //-     v-icon(v-text='mdiChevronDown' right small icon)

  </template>

</template>
<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'
import { mdiChevronDown, mdiClose } from '@mdi/js'
import { attributesFromEvents } from '../assets/helper'

export default {
  name: 'Calendar',
  data () {
    const month = dayjs.tz().month() + 1
    const year = dayjs.tz().year()
    return {
      mdiChevronDown, mdiClose,
      selectedDate: null,
      page: { month, year },
    }
  },
  computed: {
    ...mapState(['settings', 'events']),
    attributes () {
      return attributesFromEvents(this.events)
    }
  },
  methods: {
    updatePage (page) {
      if (page.month !== this.page.month || page.year !== this.page.year) {
        this.$root.$emit('monthchange', page)
        this.page.month = page.month
        this.page.year = page.year
      }
    },
    click (day) {
      this.$root.$emit('dayclick', day)
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

#calendarButton {
  margin-top: -6px;
  margin-left: -10px;
}
</style>
