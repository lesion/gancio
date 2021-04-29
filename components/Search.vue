<template lang="pug">
  v-container.pt-0.pt-md-2
    v-switch.mt-0(
      v-if='recurrentFilter && settings.allow_recurrent_event'
      v-model='showRecurrent'
      inset color='primary'
      hide-details
      :label="$t('event.show_recurrent')")
    v-autocomplete.mt-0(
      :label='$t("common.search")'
      :items='keywords'
      hide-details
      @change='change'
      :value='selectedFilters'
      clearable
      :search-input.sync='search'
      item-text='label'
      return-object
      chips single-line
      multiple)
      template(v-slot:selection="data")
        v-chip(v-bind="data.attrs"
          close
          @click:close='remove(data.item)'
          :input-value="data.selected")
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
import { mapState } from 'vuex'
export default {
  name: 'Search',
  props: {
    recurrentFilter: { type: Boolean, default: true },
    filters: { type: Object, default: () => {} }
  },
  data () {
    return {
      tmpfilter: null,
      search: ''
    }
  },
  computed: {
    ...mapState(['tags', 'places', 'settings']),
    showRecurrent: {
      get () {
        return this.filters.show_recurrent
      },
      set (v) {
        const filters = {
          tags: this.filters.tags,
          places: this.filters.places,
          show_recurrent: v
        }
        this.$emit('update', filters)
      }
    },
    selectedFilters () {
      const tags = this.tags.filter(t => this.filters.tags.includes(t.tag)).map(t => ({ type: 'tag', label: t.tag, weigth: t.weigth, id: t.tag }))
      const places = this.places.filter(p => this.filters.places.includes(p.id))
        .map(p => ({ type: 'place', label: p.name, weigth: p.weigth, id: p.id }))
      const keywords = tags.concat(places).sort((a, b) => b.weigth - a.weigth)
      return keywords
    },
    keywords () {
      const tags = this.tags.map(t => ({ type: 'tag', label: t.tag, weigth: t.weigth, id: t.tag }))
      const places = this.places.map(p => ({ type: 'place', label: p.name, weigth: p.weigth, id: p.id }))
      const keywords = tags.concat(places).sort((a, b) => b.weigth - a.weigth)
      return keywords
    }
  },
  methods: {
    remove (item) {
      const filters = {
        tags: item.type === 'tag' ? this.filters.tags.filter(f => f !== item.id) : this.filters.tags,
        places: item.type === 'place' ? this.filters.places.filter(f => f !== item.id) : this.filters.places,
        show_recurrent: this.filters.show_recurrent
      }
      this.$emit('update', filters)
    },
    change (filters) {
      filters = {
        tags: filters.filter(t => t.type === 'tag').map(t => t.id),
        places: filters.filter(p => p.type === 'place').map(p => p.id),
        show_recurrent: this.filters.show_recurrent
      }
      this.$emit('update', filters)
    }
  }
}
</script>
