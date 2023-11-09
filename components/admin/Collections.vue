<template lang='pug'>
v-container
  v-card-title {{ $t('common.collections') }}
    v-spacer
    v-text-field(v-model='search'
      :append-icon='mdiMagnify' outlined rounded
      :label="$t('common.search')"
      single-line hide-details)
  v-card-subtitle(v-html="$t('admin.collections_description')")

  v-btn(color='primary' text @click='newCollection') <v-icon v-text='mdiPlus'></v-icon> {{ $t('admin.new_collection') }}

  v-dialog(v-model='dialog' width='900' destroy-on-close :fullscreen='$vuetify.breakpoint.xsOnly')
    v-card
      v-card-title {{ $t('admin.edit_collection') }}
      v-card-text
        v-form(v-model='valid' ref='form' @submit.prevent.native='saveCollection')
          v-text-field(
            v-if='!collection.id'
            :rules="[$validators.required('common.name')]"
            :label="$t('common.name')"
            v-model='collection.name'
            :placeholder='$t("common.name")')
              template(v-slot:append-outer v-if='!collection.id')
                v-btn(text @click='saveCollection' color='primary' :loading='loading'
                  :disabled='!valid || loading || !!collection.id') {{ $t('common.save') }}
          h3(v-else class='text-h5' v-text='collection.name')

        v-row
          v-col(cols=4)
            v-autocomplete(v-model='filterActors'
              cache-items
              :prepend-inner-icon="mdiTagMultiple"
              chips small-chips multiple deletable-chips hide-no-data hide-selected persistent-hint
              :disabled="!collection.id"
              placeholder='Local'
              @input.native='searchActors'
              @focus='searchActors'
              item-text='ap_id'
              item-value='ap_id'
              :delimiters="[',', ';']"
              :items="actors"
              :label="$t('common.actors')")
                template(v-slot:selection="{ item, on, attrs, selected, parent }")
                  v-chip(v-bind="attrs" close :close-icon='mdiCloseCircle' @click:close='parent.selectItem(item)'
                    :input-value="selected" label small) {{ item }}

          v-col(cols=4)
            v-autocomplete(v-model='filterTags'
              cache-items
              :prepend-inner-icon="mdiTagMultiple"
              chips small-chips multiple deletable-chips hide-no-data hide-selected persistent-hint
              :disabled="!collection.id"
              placeholder='All'
              @input.native='searchTags'
              @focus='searchTags'
              :delimiters="[',', ';']"
              :items="tags"
              :label="$t('common.tags')")
                template(v-slot:selection="{ item, on, attrs, selected, parent }")
                  v-chip(v-bind="attrs" close :close-icon='mdiCloseCircle' @click:close='parent.selectItem(item)'
                    :input-value="selected" label small) {{ item }}

          v-col(cols=4)
            v-autocomplete(v-model='filterPlaces'
              cache-items
              :prepend-inner-icon="mdiMapMarker"
              chips small-chips multiple deletable-chips hide-no-data hide-selected persistent-hint
              auto-select-first
              clearable
              return-object
              item-text='name'
              :disabled="!collection.id"
              @input.native="searchPlaces"
              @focus='searchPlaces'
              :delimiters="[',', ';']"
              :items="places"
              :label="$t('common.places')")
                template(v-slot:selection="{ item, on, attrs, selected, parent }")
                  v-chip(v-bind="attrs" close :close-icon='mdiCloseCircle' @click:close='parent.selectItem(item)'
                    :input-value="selected" label small) {{ item.name }}

                //- template(v-slot:item="{ item, attrs, on }")
                //-   v-list-item(v-bind='attrs' v-on='on')
                //-     v-list-item-content(two-line)
                //-       v-list-item-title(v-text='item.name')
                //-       v-list-item-subtitle(v-text='item.address')

          v-btn(color='primary' :loading='loading' text @click='addFilter' :disabled='loading || !collection.id || !filterPlaces.length && !filterTags.length') add <v-icon v-text='mdiPlus'></v-icon>

        v-data-table(
          :headers='filterHeaders'
          :items='filters'
          :hide-default-footer='filters.length < 5'
          :header-props='{ sortIcon: mdiChevronDown }'
          :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }')
            template(v-slot:item.actions='{ item }')
              v-btn(@click='removeFilter(item)' color='error' icon)
                v-icon(v-text='mdiDeleteForever')
            template(v-slot:item.tags='{ item }')
              v-chip.ma-1(small label v-for='tag in item.tags' v-text='tag' :key='tag')
            template(v-slot:item.places='{ item }')
              v-chip.ma-1(small label v-for='place in item.places' v-text='place.name' :key='place.id' )


      v-card-actions
        v-spacer
        v-btn(@click='dialog = false' outlined color='warning') {{ $t('common.close') }}

  v-card-text
    v-data-table(
      :headers='collectionHeaders'
      :items='collections'
      :hide-default-footer='collections.length < 5'
      :header-props='{ sortIcon: mdiChevronDown }'
      :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
      :search='search'
    )
      template(v-slot:item.filters='{ item }')
        span {{ collectionFilters(item) }}
      template(v-slot:item.pin='{ item }')
        v-switch.float-right(:input-value='item.isTop' @change="togglePinCollection(item)" inset dense hide-details)
      template(v-slot:item.actions='{ item }')
        v-btn(@click='editCollection(item)' color='primary' icon)
          v-icon(v-text='mdiPencil')
        v-btn(@click='removeCollection(item)' color='error' icon)
          v-icon(v-text='mdiDeleteForever')

</template>
<script>
import get from 'lodash/get'
import debounce from 'lodash/debounce'
import isEqual from 'lodash/isEqual'
import sortBy from 'lodash/sortBy'

import { mdiPencil, mdiChevronLeft, mdiChevronRight, mdiMagnify, mdiPlus, mdiTagMultiple, mdiMapMarker, mdiDeleteForever, mdiCloseCircle, mdiChevronDown } from '@mdi/js'

export default {
  data() {
    return {
      mdiPencil, mdiChevronRight, mdiChevronLeft, mdiMagnify, mdiPlus, mdiTagMultiple, mdiMapMarker, mdiDeleteForever, mdiCloseCircle, mdiChevronDown,
      loading: false,
      dialog: false,
      valid: false,
      search: '',
      collection: { name: '', id: null },
      filterTags: [],
      filterPlaces: [],
      filterActors: [],
      actors: [],
      tags: [],
      places: [],
      collections: [],
      filters: [],
      tagName: '',
      placeName: '',
      collectionHeaders: [
        { value: 'name', text: this.$t('common.name') },
        { value: 'filters', text: this.$t('common.filter') },
        { value: 'pin', text: this.$t('common.pin'), align: 'right' },
        { value: 'actions', text: this.$t('common.actions'), align: 'right', width: 150 }
      ],
      filterHeaders: [
        { value: 'actors', text: this.$t('common.actors') },
        { value: 'tags', text: this.$t('common.tags') },
        { value: 'places', text: this.$t('common.places') },
        { value: 'actions', text: this.$t('common.actions'), align: 'right' }
      ]
    }
  },
  async fetch() {
    this.collections = await this.$axios.$get('/collections?withFilters=true')
  },

  methods: {
    searchTags: debounce(async function (ev) {
      this.tags = await this.$axios.$get(`/tag?search=${encodeURIComponent(ev.target.value)}`)
    }, 100),
    searchPlaces: debounce(async function (ev) {
      this.places = await this.$axios.$get(`/place?search=${ev.target.value}`)
    }, 100),
    searchActors: debounce(async function (ev) {
      this.actors = await this.$axios.$get(`/instances/friendly?search=${ev.target.value}`)
    }, 100),
    collectionFilters(collection) {
      return collection.filters.map(f => {
        const tags = f.tags?.join(', ')
        const places = f.places?.map(p => p.name).join(', ')
        return '(' + (tags && places ? tags + ' - ' + places : tags + places) + ')'
      }).join(' - ')
    },
    async addFilter() {
      this.loading = true
      const tags = this.filterTags
      const places = this.filterPlaces.map(p => ({ id: p.id, name: p.name }))

      const filter = { collectionId: this.collection.id, tags, places }

      // tags and places are JSON field and there's no way to use them inside a unique constrain
      //
      const alreadyExists = this.filters.find(f =>
        isEqual(sortBy(f.places, 'id'), sortBy(filter.places, 'id')) && isEqual(sortBy(f.tags), sortBy(filter.tags))
      )

      if (alreadyExists) return

      const ret = await this.$axios.$post('/filter', filter )
      this.$fetch()
      this.filters.push(ret)
      this.filterTags = []
      this.filterPlaces = []
      this.loading = false
    },
    async editCollection(collection) {
      this.collection = { ...collection }
      this.filters = await this.$axios.$get(`/filter/${collection.id}`)
      this.dialog = true
    },
    newCollection() {
      this.collection = { name: '', id: null }
      this.filters = []
      this.dialog = true
    },
    async saveCollection() {
      if (!this.$refs.form.validate()) return
      this.loading = true
      this.collection.name = this.collection.name.trim()
      this.collection = await this.$axios.$post('/collections', this.collection)
      this.$fetch()
      this.loading = false
    },
    async togglePinCollection (collection) {
      try {
        collection.isTop = await this.$axios.$put(`/collection/toggle/${collection.id}`)
      } catch (e) {
        const err = get(e, 'response.data.errors[0].message', e)
        this.$root.$message(this.$t(err), { color: 'error' })        
      }
    },
    async removeFilter(filter) {
      try {
        await this.$axios.$delete(`/filter/${filter.id}`)
        this.filters = this.filters.filter(f => f.id !== filter.id)
        this.$fetch()
      } catch (e) {
        const err = get(e, 'response.data.errors[0].message', e)
        this.$root.$message(this.$t(err), { color: 'error' })
        this.loading = false
      }
    },
    async removeCollection(collection) {
      const ret = await this.$root.$confirm('admin.delete_collection_confirm', { collection: collection.name })
      if (!ret) { return }
      try {
        await this.$axios.$delete(`/collection/${collection.id}`)
        this.collections = this.collections.filter(c => c.id !== collection.id)
      } catch (e) {
        const err = get(e, 'response.data.errors[0].message', e)
        this.$root.$message(this.$t(err), { color: 'error' })
        this.loading = false
      }
    }
  }
}
</script>
<style>

/**  this is for the switch */
.v-data-table .v-input--selection-controls {
  margin-top: 0;
  padding-top: 0;
}
</style>