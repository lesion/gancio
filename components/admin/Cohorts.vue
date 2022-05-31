<template lang='pug'>
v-container
  v-card-title {{$t('common.cohort')}}
    v-spacer
    v-text-field(v-model='search'
    :append-icon='mdiMagnify' outlined rounded
    label='Search'
    single-line hide-details)
  v-card-subtitle(v-html="$t('admin.cohort_description')")

  v-btn(color='primary' text @click='newCohort') <v-icon v-text='mdiPlus'></v-icon> {{$t('common.new')}}

  v-dialog(v-model='dialog' width='800' destroy-on-close :fullscreen='$vuetify.breakpoint.xsOnly')
    v-card(color='secondary')
      v-card-title {{$t('admin.edit_cohort')}}
      v-card-text
        v-form(v-model='valid' ref='form')
          v-text-field(
            v-if='!cohort.id'
            :rules="[$validators.required('common.name')]"
            :label="$t('common.name')"
            v-model='cohort.name'
            :placeholder='$t("common.name")')
              template(v-slot:append-outer v-if='!cohort.id')
                v-btn(text @click='saveCohort' color='primary' :loading='loading'
                  :disabled='!valid || loading || !!cohort.id') {{$t('common.save')}}
          h3(v-else class='text-h5' v-text='cohort.name')

        v-row
          v-col(cols=5)
            v-autocomplete(v-model='filterTags'
              cache-items
              :prepend-icon="mdiTagMultiple"
              
              chips small-chips multiple deletable-chips hide-no-data hide-selected persistent-hint
              :disabled="!cohort.id"
              placeholder='Tutte'
              @input.native='searchTags'
              :delimiters="[',', ';']"
              :items="tags"
              :label="$t('common.tags')")

          v-col(cols=5)
            v-autocomplete(v-model='filterPlaces'
              cache-items
              :prepend-icon="mdiMapMarker"
              chips small-chips multiple deletable-chips hide-no-data hide-selected persistent-hint
              auto-select-first
              clearable
              return-object
              item-text='name'
              :disabled="!cohort.id"
              @input.native="searchPlaces"
              :delimiters="[',', ';']"
              :items="places"
              :label="$t('common.places')")
                //- template(v-slot:item="{ item, attrs, on }")
                //-   v-list-item(v-bind='attrs' v-on='on')
                //-     v-list-item-content(two-line)
                //-       v-list-item-title(v-text='item.name')
                //-       v-list-item-subtitle(v-text='item.address')
            
          v-col(cols=2)
            v-btn(color='primary' text @click='addFilter' :disabled='!cohort.id || !filterPlaces.length && !filterTags.length') add <v-icon v-text='mdiPlus'></v-icon>
            

        v-data-table(
          :headers='filterHeaders'
          :items='filters'
          :hide-default-footer='filters.length<5'
          :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }')
            template(v-slot:item.actions='{item}')
              v-btn(@click='removeFilter(item)' color='error' icon)
                v-icon(v-text='mdiDeleteForever')
            template(v-slot:item.tags='{item}')
              v-chip.ma-1(small v-for='tag in item.tags' v-text='tag' :key='tag')
            template(v-slot:item.places='{item}')
              v-chip.ma-1(small v-for='place in item.places' v-text='place.name' :key='place.id' )
            


      v-card-actions
          v-spacer
          v-btn(text @click='dialog=false' color='warning') {{$t('common.close')}}
          //- v-btn(text @click='saveCohort' color='primary' :loading='loading'
          //-     :disable='!valid || loading') {{$t('common.save')}}

  v-card-text
    v-data-table(
    :headers='cohortHeaders'
    :items='cohorts'
    :hide-default-footer='cohorts.length<5'
    :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
    :search='search')
      template(v-slot:item.filters='{item}')
        span {{cohortFilters(item)}}
      template(v-slot:item.actions='{item}')
          v-btn(@click='editCohort(item)' color='primary' icon)
            v-icon(v-text='mdiPencil')
          v-btn(@click='removeCohort(item)' color='error' icon)
            v-icon(v-text='mdiDeleteForever')

</template>
<script>
import get from 'lodash/get'
import debounce from 'lodash/debounce'
import { mdiPencil, mdiChevronLeft, mdiChevronRight, mdiMagnify, mdiPlus, mdiTagMultiple, mdiMapMarker, mdiDeleteForever, mdiCloseCircle } from '@mdi/js'

export default {
  data () {
    return {
      mdiPencil, mdiChevronRight, mdiChevronLeft, mdiMagnify, mdiPlus, mdiTagMultiple, mdiMapMarker, mdiDeleteForever, mdiCloseCircle,
      loading: false,
      dialog: false,
      valid: false,
      search: '',
      cohort: { name: '', id: null },
      filterTags: [],
      filterPlaces: [],
      tags: [],
      places: [],
      cohorts: [],
      filters: [],
      tagName: '',
      placeName: '',
      cohortHeaders: [
        { value: 'name', text: 'Name' },
        { value: 'filters', text: 'Filters' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ],
      filterHeaders: [
        { value: 'tags', text: 'Tags' },
        { value: 'places', text: 'Places' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ]
    }
  },
  async fetch () {
    this.cohorts = await this.$axios.$get('/cohorts?withFilters=true')
  },

  methods: {
    searchTags: debounce(async function (ev) {
      this.tags = await this.$axios.$get(`/tag?search=${ev.target.value}`)
    }, 100),
    searchPlaces: debounce(async function (ev) {
      this.places = await this.$axios.$get(`/place?search=${ev.target.value}`)
    }, 100),
    cohortFilters (cohort) {
      return cohort.filters.map(f => {
        return '(' + f.tags?.join(', ') + f.places?.map(p => p.name).join(', ') + ')'
      }).join(' - ')
    },
    async addFilter () {
      this.loading = true
      const tags = this.filterTags
      const places = this.filterPlaces.map(p => ({ id: p.id, name: p.name }))
      const filter = await this.$axios.$post('/filter', { cohortId: this.cohort.id, tags, places })
      this.$fetch()
      this.filters.push(filter)
      this.filterTags = []
      this.filterPlaces = []
      this.loading = false
    },
    async editCohort (cohort) {
      this.cohort = { ...cohort }
      this.filters = await this.$axios.$get(`/filter/${cohort.id}`)
      this.dialog = true
    },
    newCohort () {
      this.cohort = { name: '', id: null },
      this.filters = []
      this.dialog = true
    },
    async saveCohort () {
      if (!this.$refs.form.validate()) return
      this.loading = true
      this.cohort = await this.$axios.$post('/cohorts', this.cohort)
      this.$fetch()
      this.loading = false
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
    async removeCohort (cohort) {
      const ret = await this.$root.$confirm('admin.delete_cohort_confirm', { cohort: cohort.name })
      if (!ret) { return }
      try {
        await this.$axios.$delete(`/cohort/${cohort.id}`)
        this.cohorts = this.cohorts.filter(c => c.id !== cohort.id)
      } catch (e) {
        const err = get(e, 'response.data.errors[0].message', e)
        this.$root.$message(this.$t(err), { color: 'error' })
        this.loading = false
      }
    }
  }
}
</script>