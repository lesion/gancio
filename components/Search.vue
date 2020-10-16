<template lang="pug">
  v-container
    v-switch.mt-0(
      v-if='recurrentFilter && settings.allow_recurrent_event'
      inset color='primary'
      :label="$t('event.show_recurrent')"
      v-model='showRecurrent')

    v-switch.mt-0(
      v-if='pastFilter' inset color='primary'
      :label="$t('event.show_past')"
      v-model='showPast')

    v-autocomplete.mt-0(
      :label='$t("common.search")'
      :items='keywords'
      v-model='filter'
      :search-input.sync='search'
      item-text='label'
      item-value='id'
      chips rounded outlined single-line
      multiple)
      template(v-slot:selection="data")
        v-chip(v-bind="data.attrs"
          :input-value="data.selected"
          close
          @click="data.select"
          @click:close="remove(data.item)")
          v-avatar(left)
            v-icon {{data.item.type === 'place' ? 'mdi-map-marker' : 'mdi-tag' }}
          span {{ data.item.label }}
      template(v-slot:item='{ item }')
          v-list-item-avatar
            v-icon {{item.type === 'place' ? 'mdi-map-marker' : 'mdi-tag' }}
          v-list-item-content
            v-list-item-title(v-text='item.label')
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  name: 'Search',
  props: {
    pastFilter: Boolean,
    recurrentFilter: Boolean
  },
  data () {
    return {
      tmpfilter: null,
      search: ''
    }
  },
  computed: {
    filter: {
      set (value) {
        console.error('set', value)
        this.tmpfilter = value
      },
      get () {
        // console.error('dentro get')
        // const tags = this.filters.tags.map(t => t.tag)// ({ type: 'tag', label: t.tag, weigth: t.weigth, id: t.tag }))
        // const places = this.filters.places.map(p => p.name) //({ type: 'place', label: p.name, weigth: p.weigth, id: p.id }))
        // const keywords = tags.concat(places).sort((a, b) => b.weigth - a.weigth)
        // const ret = tags.concat(places)
        // console.error(ret)
        return this.tmpfilter
        // const ret = this.filters.tags
        // console.error(ret)
        // return ret
        // return ['ciao']
      }
    },
    ...mapState(['tags', 'places', 'filters', 'settings']),
    // selectedPlaces () {
    //   return this.places.filter(p => this.filters.places.includes(p.id))
    // },
    keywords () {
      const tags = this.tags.filter(t => !this.filters.tags.includes(t.tag)).map(t => ({ type: 'tag', label: t.tag, weigth: t.weigth, id: t.tag }))
      const places = this.places.filter(p => !this.filters.places.includes(p.id))
        .map(p => ({ type: 'place', label: p.name, weigth: p.weigth, id: p.id }))
      const keywords = tags.concat(places).sort((a, b) => b.weigth - a.weigth)
      return keywords
    },
    showPast: {
      set (value) { this.showPastEvents(value) },
      get () { return this.filters.show_past_events }
    },
    showRecurrent: {
      set (value) { this.showRecurrentEvents(value) },
      get () { return this.filters.show_recurrent_events }
    }
    // filter () {
    //   return this.filters.tags.concat(this.filters.places)
    // }
  },
  methods: {
    ...mapActions(['setSearchPlaces', 'setSearchTags',
      'showPastEvents', 'showRecurrentEvents', 'updateEvent']),
    remove (item) {
      console.error(item)
      if (item.type === 'tag') {
        this.removeTag(item.id)
      } else {
        this.removePlace(item.id)
      }
    },
    removeTag (tag) {
      this.setSearchTags(this.filters.tags.filter(t => t !== tag))
    },
    removePlace (place) {
      this.setSearchPlaces(this.filters.places.filter(p => p !== place))
    },
    querySearch (queryString, cb) {
      const ret = this.keywords
        .filter(k => !this.filter.map(f => f.id).includes(k.id))
        .filter(k => k.label.toLowerCase().includes(queryString))
        .slice(0, 5)
      cb(ret)
    },
    addFilter (item) {
      if (item.type === 'tag') {
        this.setSearchTags(this.filters.tags.concat(item.id))
      } else {
        this.setSearchPlaces(this.filters.places.concat(item.id))
      }
      this.search = ''
    }
  }
}
</script>
