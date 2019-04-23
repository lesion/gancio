<template lang="pug">
  div
    magic-grid(:animate="false" useMin :gap=5 :maxCols=4
      :maxColWidth='400' ref='magicgrid')
      div.mt-1.item
        //- Search#search
        no-ssr
          Calendar
    Event.item.mt-1(v-for='event in events'
      :key='event.id'
      :event='event')
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
// import filters from '@/filters.js'
import Event from '@/components/Event'
import Calendar from '@/components/Calendar'
// import { intersection } from 'lodash'
// import moment from 'dayjs'
// import Search from '@/components/Search'

export default {
  name: 'Home',
  // async asyncData ({req}) {
  //   console.log('dentro asyncData')
  //   const { data } = await axios.get('http://localhost:3000/api/event/2019/2')
  //   return { events: data }
  // },
  components: { Event, Calendar }, // , Calendar, Search },
  computed: {
    ...mapState(['events', 'filters']),
    filteredEvents() {
      return this.events
      // return this.$store.getters.filteredEvents
        .filter(e => !e.past)
        .sort((a, b) => a.start_datetime > b.start_datetime)
    }
  },
  watch: {
    filteredEvents() {
      this.$nextTick(this.$refs.magicgrid.positionItems)
    }
  }
}
</script>
<style>
#search {
  display: inline-flex;
}

.item {
  width: 100%;
  max-width: 400px;
  margin-top: 4px;
  position: absolute;
  cursor: pointer;
}

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

/* .item {
  transition: all .2s;
  display: inline-block;
  width: 100%;
} */
/* .list-enter, .list-leave-to {
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
} */
</style>
