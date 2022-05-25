<template>
  <v-container class='pt-0.pt-md-2'>
    <!-- <v-switch class='mt-0'
      v-if='recurrentFilter && settings.allow_recurrent_event'
      v-model='showRecurrent'
      inset color='primary'
      hide-details
      :label="$t('event.show_recurrent')"/> -->

    <v-combobox
      :label='$t("common.search")'
      :items='items'
      no-filter
      @input='input'
      hide-details
      :menu-props="{ maxWidth: '400' }"
      :search-input.sync='search'>
        <!-- <template v-slot:selection="{ item, on, attrs, selected, parent}">
          <span>{{selected}}</span>
        </template> -->
      <!-- template(v-slot:selection="data")
        v-chip(v-bind="data.attrs"
          close
          :close-icon='mdiCloseCircle'
          @click:close='remove(data.item)'
          :input-value="data.selected")
          v-avatar(left)
            v-icon(v-text="data.item.type === 'place' ? mdiMapMarker : mdiTag")
          span {{ data.item.label }} -->
      <template v-slot:item='{ item }' >
        <v-list-item-avatar v-if="['place','tag'].includes(item.type)">
          <v-icon small v-text="item.type === 'place' ? mdiMapMarker : mdiTag" />
        </v-list-item-avatar>
        <v-list-item-content v-if="item.type === 'event'">
          <v-list-item-title v-text='item.title'/>
          <v-list-item-subtitle>{{item.start_datetime | from}} @{{item.place.name}}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-title v-else-if='item.type==="tag"' v-text='item.tag' />
        <v-list-item-title v-else-if='item.type==="place"' v-text='item.name' />
      </template>
    </v-combobox>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { mdiMapMarker, mdiTag, mdiCloseCircle } from '@mdi/js'
export default {
  name: 'Search',
  props: {
    recurrentFilter: { type: Boolean, default: true },

  },
  data () {
    return {
      mdiTag, mdiMapMarker, mdiCloseCircle,
      item: '',
      items: [],
      search: ''
    }
  },
  watch: {
    async search (search) {
      if (!search) return
      this.items = await this.$axios.$get('/event/search', { params: { search } })
    }
  },
  computed: {
    ...mapState(['settings']),
    // showRecurrent: {
    //   get () {
    //     return this.filters.show_recurrent
    //   },
    //   set (v) {
    //     const filters = {
    //       tags: this.filters.tags,
    //       places: this.filters.places,
    //       show_recurrent: v
    //     }
    //     this.$emit('update', filters)
    //   }
    // },
    // selectedFilters () {
    //   const tags = this.tags.filter(t => this.filters.tags.includes(t.tag)).map(t => ({ type: 'tag', label: t.tag, weigth: t.weigth, id: t.tag }))
    //   const places = this.places.filter(p => this.filters.places.includes(p.id))
    //     .map(p => ({ type: 'place', label: p.name, weigth: p.weigth, id: p.id }))
    //   const keywords = tags.concat(places).sort((a, b) => b.weigth - a.weigth)
    //   return keywords
    // },
    // keywords () {
    //   const tags = this.tags.map(t => ({ type: 'tag', label: t.tag, weigth: t.weigth, id: t.tag }))
    //   const places = this.places.map(p => ({ type: 'place', label: p.name, weigth: p.weigth, id: p.id }))
    //   const keywords = tags.concat(places).sort((a, b) => b.weigth - a.weigth)
    //   return keywords
    // }
  },
  methods: {
    // remove (item) {
    //   const filters = {
    //     tags: item.type === 'tag' ? this.filters.tags.filter(f => f !== item.id) : this.filters.tags,
    //     places: item.type === 'place' ? this.filters.places.filter(f => f !== item.id) : this.filters.places,
    //     show_recurrent: this.filters.show_recurrent
    //   }
    //   this.$emit('update', filters)
    // },
    input (item) {
      if (typeof item ==='object') {
        this.$emit(`${item.type}:selected`, item)
      } else {
        this.$emit('update', item)
      }
    },
  }
}
</script>
