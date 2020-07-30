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

    p {{filter}}
    v-autocomplete.mt-0(
      :label='$t("common.filter")'
      :items='keywords'
      v-model='filter'
      :search-input.sync='search'
      item-text='label'
      chips
      multiple
    )
      template(v-slot:selection="data")
        v-chip(v-bind="data.attrs"
          :input-value="data.selected"
          close
          @click="data.select"
          @click:close="remove(data.item)")
          v-avatar(left)
            v-icon
            //- <v-img :src="data.item.avatar"></v-img>
          //- </v-avatar>
          span {{ data.item.name }}
      template(v-slot:item='{ item }')
        v-list-item-content
          v-list-item-title(v-text='item.label')
      //-   span.float-left {{ item.label }}
      //-   i.float-right.el-icon-place(v-if='item.type==="place"')
      //-   i.float-right.el-icon-collection-tag(v-if='item.type==="tag"')
    //- #filters
    //-   v-vtn.mr-1.bg-dark(type='text' round plain v-for='t in filters.tags' size='mini'
    //-     :key='t' @click='removeTag(t)') {{t}}
    //-   v-btn.mr-1.bg-dark.text-warning(type='text' round plain v-for='p in selectedPlaces' size='mini'
    //-     :key='p.id' @click='removePlace(p.id)') {{p.name}}
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
      filter: null,
      search: ''
    }
  },
  computed: {
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
// #search {
//   #searchInput {
//     border: none;
//     border-radius: 0px;
//     border-bottom: 2px solid lightgray;
//     color: white;
//     background-color: #111;
//   }

//   .el-switch__label {
//     color: #aaa;
//   }

//   .el-switch__label.is-active {
//     color: lightgreen;
//   }

//   .el-switch__core {
//     background-color: #555;
//     border-color: #777;
//   }

//   .is-checked .el-switch__core {
//     background-color: lightgreen;
//   }

//   #filters {
//     line-height: 2rem;
//   }
// }


</style>
