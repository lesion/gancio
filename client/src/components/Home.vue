<template lang="pug">
  b-container
    b-card-group.card-horiz
      b-form-group.mt-1
        Search#search
        Calendar
      Event.item(v-for='event in filteredEvents'
        :key='event.id'
        :event='event')
</template>
<script>
import { mapState } from 'vuex'
import filters from '@/filters.js'
import Event from '@/components/Event'
import Calendar from '@/components/Calendar'
import {intersection} from 'lodash'
import moment from 'moment'
import Search from '@/components/Search'

export default {
  name: 'Home',
  components: { Event, Calendar, Search },
  computed: {
    ...mapState(['events', 'filters']),
    filteredEvents () {
      return this.$store.getters.filteredEvents.filter(e => !e.past)
    }
  }
}
</script>
<style>

#search {
  display: inline-flex;
}
/* 
.card-horiz {
  flex-flow: row wrap;
  display: flex;
  /*! margin-left: -8px; */
}
.card-horiz .card {
  width: 400px !important;
} */

.card-columns {
  column-count: 1;
  column-gap: 0.2em;
}
@media (min-width: 576px) {
  .container {
    max-width: none;
  }
  .card-columns {
    column-count: 2;
  }
}

@media (min-width: 950px) {
  .container {
    max-width: 1400px;
  }
  .card-columns {
    column-count: 3;
  }
}

.item {
  transition: all .2s;
  display: inline-block;
  width: 100%;
}
.list-enter, .list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.list-leave-active {
  position: absolute;
  top: 0px;
  width: 0px;
  left: 0px;
  height: 0px;
  z-index: -10;
}
</style>
