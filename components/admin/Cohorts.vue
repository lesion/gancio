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
        v-form(v-model='valid' ref='form' lazy-validation)
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
              :prepend-icon="mdiTagMultiple"
              chips small-chips multiple deletable-chips hide-no-data hide-selected persistent-hint
              no-filter
              :disabled="!cohort.id"
              placeholder='Tutte'
              :search-input.sync="tagName"
              :delimiters="[',', ';']"
              :items="filteredTags"
              :label="$t('common.tags')")

          v-col(cols=5)
            v-autocomplete(v-model='filterPlaces'
              :prepend-icon="mdiMapMarker"
              chips small-chips multiple deletable-chips hide-no-data hide-selected persistent-hint
              no-filter
              item-text='name'
              return-object
              :disabled="!cohort.id"
              :search-input.sync="placeName"
              :delimiters="[',', ';']"
              :items="filteredPlaces"
              :label="$t('common.places')")
            
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
import { mapActions, mapState } from 'vuex'
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
  computed:{
    ...mapState(['tags', 'settings', 'places']),
    filteredTags () {
      if (!this.tagName) { return this.tags.slice(0, 10).map(t => t.tag) }
      const tagName = this.tagName.trim().toLowerCase()
      return this.tags.filter(t => t.tag.toLowerCase().includes(tagName)).map(t => t.tag)
    },
    filteredPlaces () {
      if (!this.placeName) { return this.places }
      const placeName = this.placeName.trim().toLowerCase()
      let nameMatch = false
      const matches = this.places.filter(p => {
        const tmpName = p.name.toLowerCase()
        const tmpAddress = p.address.toLowerCase()
        if (tmpName.includes(placeName)) {
          if (tmpName === placeName) { nameMatch = true }
          return true
        }
        return tmpAddress.includes(placeName)
      })
      if (!nameMatch) {
        matches.unshift({ create: true, name: this.placeName })
      }
      return matches
    }    
  },
  async fetch () {
    this.cohorts = await this.$axios.$get('/cohorts?withFilters=true')
  },

  methods: {
    ...mapActions(['updateMeta']),
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