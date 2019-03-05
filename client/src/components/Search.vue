<template lang="pug">
  div
    el-select.mr-1(v-model='filters_places' multiple filterable collapse-tags
      default-first-option :placeholder='$t("Where")')
      el-option(v-for='place in places' :value='place.name'
        :label='place.name' :key='place.id')
    el-select(v-model='filters_tags' multiple filterable collapse-tags
      default-first-option :placeholder='$t("Tags")')
      el-option(v-for='tag in tags' :key='tag.tag'
        :label='tag.tag' :value='tag.tag') 
</template>
<script>
import {mapState, mapActions} from 'vuex'

export default {
  name :'Search',
  methods: mapActions(['setSearchPlaces', 'setSearchTags']),
  computed: {
    ...mapState(['tags', 'places', 'filters']),
    filters_tags: {
      set (value) {
        this.setSearchTags(value)
      },
      get () {
        return this.filters.tags
      }
    },
    filters_places: {
      set (value) {
        this.setSearchPlaces(value)
      },
      get () {
        return this.filters.places
      }
    },    
  }
}
</script>
