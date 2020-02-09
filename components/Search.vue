<template lang="pug">
  el-main
    el-switch.mt-1.mb-2.ml-2.d-block(
      v-if='recurrentFilter && settings.allow_recurrent_event'
      :active-text="$t('event.show_recurrent')"
      v-model='showRecurrent')

    el-switch.mt-1.mb-2.ml-2.d-block(
      v-if='pastFilter'
      :active-text="$t('event.show_past')"
      v-model='showPast')

    el-autocomplete.mb-1#search.inline-input(:placeholder='$t("common.filter")' prefix-icon='el-icon-search'
      highlight-first-item
      v-model='search' :debounce='200'
      :fetch-suggestions='querySearch' clearable
      @select='addFilter')
      template(slot-scope='{ item }')
        span.float-left {{ item.label }}
        i.float-right.el-icon-place(v-if='item.type==="place"')
        i.float-right.el-icon-collection-tag(v-if='item.type==="tag"')
    #filters
      el-button.mr-1.bg-dark(type='text' round plain v-for='t in filters.tags' size='mini'
        :key='t' @click='removeTag(t)') {{t}}
      el-button.mr-1.bg-dark.text-warning(type='text' round plain v-for='p in selectedPlaces' size='mini'
        :key='p' @click='removePlace(p.id)') {{p.name}}
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
      search: ''
    }
  },
  computed: {
    ...mapState(['tags', 'places', 'filters', 'settings']),
    selectedPlaces () {
      return this.places.filter(p => this.filters.places.includes(p.id))
    },
    keywords () {
      const tags = this.tags.filter(t => !this.filters.tags.includes(t.tag)).map(t => ({ type: 'tag', label: t.tag, weigth: t.weigth, id: t.tag }))
      const places = this.places.filter(p => !this.filters.places.includes(p.id)).map(p => ({ type: 'place', label: p.name, weigth: p.weigth, id: p.id }))
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
    },
    filter () {
      return this.filters.tags.concat(this.filters.places)
    }
  },
  methods: {
    ...mapActions(['setSearchPlaces', 'setSearchTags',
      'showPastEvents', 'showRecurrentEvents', 'updateEvent']),
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
<style lang='less'>
#search {
  border: none;
  border-radius: 0px;
  border-bottom: 2px solid lightgray;
  color: white;
  background-color: #111;
}

#filters {
  line-height: 2rem;
}

.el-switch__label {
  color: #aaa;
}

.el-switch__label.is-active {
  color: lightgreen;
}

.el-switch__core {
  background-color: #555;
  border-color: #777;
}
</style>
