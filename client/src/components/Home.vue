<template lang="pug">
  b-container
    b-card-group(columns)
      Calendar
      //- transition-group(name="list" tag="div")
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
export default {
  name: 'Home',
  components: { Event, Calendar },
  computed: {
    ...mapState(['events', 'filters']),
    filteredEvents () {
      if (!this.filters.tags.length && !this.filters.places.length) return this.events
      return this.events.filter(e => {
        if (this.filters.tags.length) {
          const m = intersection(e.tags.map(t => t.tag), this.filters.tags)
          if (m.length>0) return true
        }
        if (this.filters.places.length) {
          if (this.filters.places.find(p => p === e.place.name))
            return true
        }
        return 0
      })
    }
  }
}
</script>
<style>

.card-columns {
  column-count: 1;
  column-gap: 0.3em;
}
@media (min-width: 576px) {
  .container {
    max-width: none;
  }
  .card-columns {
    column-count: 2;
    column-gap: 0.3em;
  }
}

@media (min-width: 950px) {
  .container {
    max-width: 1400px;
  }
  .card-columns {
    column-count: 3;
    column-gap: 0.3em;
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
