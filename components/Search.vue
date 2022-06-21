<template lang="pug">
v-row
  v-col(cols=12)
    v-switch(
      v-if='settings.allow_recurrent_event'
      v-model='show_recurrent'
      @change='change'
      inset color='primary'
      hide-details
      :label="$t('event.show_recurrent')")
  v-col.mb-4(cols=12)
    v-autocomplete.p-0(
      v-model='meta'
      :label='$t("common.search")'
      :filter='filter'
      cache-items
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
            v-icon(small v-text="item.type === 'place' ? mdiMapMarker : mdiTag")
          span {{ item.label }}
      template(v-slot:item='{ item }')
          v-list-item-avatar
            v-icon(v-text="item.type === 'place' ? mdiMapMarker : mdiTag")
          v-list-item-content
            v-list-item-title(v-text='item.label')
            v-list-item-subtitle(v-if='item.type ==="place"' v-text='item.address')
</template>

<script>
import { mapState } from 'vuex'
import { mdiMapMarker, mdiTag, mdiCloseCircle } from '@mdi/js'
import debounce from 'lodash/debounce'

export default {
  name: 'Search',
  props: {
    filters: { type: Object, default: () => ({ }) }
  },
  data () {
    return {
      mdiTag, mdiMapMarker, mdiCloseCircle,
      meta: [],
      items: [],
      show_recurrent: this.filters.show_recurrent || false
    }
  },
  computed: mapState(['settings']),
  methods: {
    filter (item, queryText, itemText) {
      return itemText.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1 || 
              item.address && item.address.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
    },
    search: debounce(async function(search) {
      this.items = await this.$axios.$get(`/event/meta?search=${search.target.value}`)
    }, 100),
    remove (item) {
      this.meta = this.meta.filter(m => m.type !== item.type || m.type === 'place' ? m.id !== item.id : m.label !== item.label)
      this.change()
    },
    change () {
      const filters = {
        tags: this.meta.filter(t => t.type === 'tag').map(t => t.label),
        places: this.meta.filter(p => p.type === 'place').map(p => p.id),
        show_recurrent: this.show_recurrent
      }
      this.$emit('update', filters)
    }
  }
}
</script>
