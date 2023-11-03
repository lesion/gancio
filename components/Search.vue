<template lang="pug">
v-row
  v-col(sm=3 cols=12)
    v-switch(
      v-if='settings.allow_recurrent_event'
      v-model='show_recurrent'
      @change='change'
      inset color='primary'
      hide-details
      :label="$t('event.show_recurrent')")
  v-col(sm="5" cols=12)
    v-autocomplete.p-0(
      :disabled='!!collection'
      v-model="filters"
      outlined
      :label='$t("common.filter")'
      hide-details
      color='primary'
      hide-selected
      small-chips
      @focus='search'
      :menu-props="{ maxWidth: '400' }"
      :items='items'
      @change='change'
      hide-no-data
      @input.native='search'
      item-text='label'
      return-object
      chips
      multiple)
      template(v-slot:selection="{ attrs, item }")
        v-chip(v-bind="attrs"
          small
          close
          @click:close='remove(item)'
          :close-icon='mdiCloseCircle')
          v-avatar(left)
            v-icon(small v-text="item.type === 'place' ? mdiMapMarker : item.type === 'tag' ? mdiTag : mdiCollage")
          span {{ item.label }}
      template(v-slot:item='{ item }')
          v-list-item-avatar
            v-icon(v-text="item.type === 'place' ? mdiMapMarker : item.type === 'tag' ? mdiTag : mdiCollage")
          v-list-item-content
            v-list-item-title(v-text='item.label')
            v-list-item-subtitle(v-if='item.type ==="place"' v-text='item.label !== "online" && item.address')

  v-col(sm=4 cols=12)
    v-autocomplete.p-0(
      :disabled='!!filters.length'
      v-model="collection"
      outlined
      :label='$t("common.collections")'
      hide-details
      color='primary'
      hide-selected
      :menu-props="{ maxWidth: '400' }"
      :items='collections'
      @change='change'
      hide-no-data
      clearable
      :clear-icon='mdiCloseCircle'
      item-text='name')
      template(v-slot:itsdfems='{ item }')
          v-list-item-avatar
            v-icon(v-text="item.type === 'place' ? mdiMapMarker : item.type === 'tag' ? mdiTag : mdiCollage")
          v-list-item-content
            v-list-item-title(v-text='item.label')
            v-list-item-subtitle(v-if='item.type ==="place"' v-text='item.label !== "online" && item.address')            
</template>

<script>
import { mapState } from 'vuex'
import { mdiMapMarker, mdiTag, mdiCloseCircle, mdiCollage } from '@mdi/js'
import debounce from 'lodash/debounce'

export default {
  name: 'Search',
  props: {
    value: { type: Object, default: () => ({ }) }
  },
  data () {
    return {
      mdiTag, mdiMapMarker, mdiCloseCircle, mdiCollage,
      items: [],
      filters: [],
      collection: null,
      collections: [],
      show_recurrent: this.value.show_recurrent || false
    }
  },
  async fetch () {
    this.collections = await this.$axios.$get('/collections')
  },
  computed: {
    ...mapState(['settings']),
  },
  methods: {
    filter (item, queryText, itemText) {
      return itemText.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1 || 
              item.address && item.address.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
    },
    search: debounce(async function(search) {
      this.items = await this.$axios.$get(`/event/meta?search=${search.target.value}`)
      console.error('items ', this.items.length)
    }, 100),
    remove (item) {
      // const filters = {
      //     tags: this.filters.filter(t => t.type === 'tag' && t.label !== item.label).map(t => t.label),
      //     places: this.filters.filter(p => p.type === 'place' && p.id !== item.id).map(p => p.id),
      //     show_recurrent: this.show_recurrent
      //   }      
      this.filters = this.filters.filter(m => m.type !== item.type || m.type === 'place' ? m.id !== item.id : m.label !== item.label)
      // this.$emit('input', filters)
      this.change()
    },
    change () {
      if (this.collection) {
        this.filters = []
        this.$emit('input', { collection: this.collection, places: [], tags: [], show_recurrent: this.show_recurrent  })
      } else {
        
        const filters = {
          tags: this.filters.filter(t => t.type === 'tag').map(t => t.label),
          places: this.filters.filter(p => p.type === 'place').map(p => p.id),
          show_recurrent: this.show_recurrent
        }
        this.$emit('input', filters)
      }
    }
  }
}
</script>
