<template lang="pug">
  div.ml-2.mt-1.text-center
    //- el-switch.mb-1(v-if='$auth.loggedIn'
    //-   active-text='solo miei'
    //-   inactive-text='tutti'
    //-   inactive-color='lightgreen'
    //-   v-model='onlyMine'
    //- )
    el-switch.mt-1.mb-1.ml-2.d-block(
      v-if='pastFilter'
      inactive-text=''
      active-text='anche appuntamenti fissi'
      inactive-color='lightgreen'
      v-model='showRecurrent'
    )
    el-switch.mt-1.mb-1.ml-2.d-block(
      v-if='recurrentFilter'
      inactive-text='solo futuri'
      active-text='anche passati'
      inactive-color='lightgreen'
      v-model='showPast'
    )    
    no-ssr
      el-select.search(v-model='filter'
        multiple 
        filterable collapse-tags default-first-option
        :placeholder='$t("common.search")')
        el-option(v-for='(keyword, id) in keywords' :key='keyword.value'
          :label='keyword.label' :value='keyword.value')

</template>

<script>
import {mapState, mapActions} from 'vuex'
export default {
  data () {
    return {
      onlyMine: false,
    }
  },
  name :'Search',
  props: {
    pastFilter: Boolean,
    recurrentFilter: Boolean
  },
  methods: mapActions(['setSearchPlaces', 'setSearchTags', 'showPastEvents', 'showRecurrentEvents']),
  computed: {
    ...mapState(['tags', 'places', 'filters']),
    // TOFIX: optimize
    keywords () {
      const tags = this.tags.map( t => ({ value: 't' + t.tag, label: t.tag, weigth: t.weigth }))
      const places = this.places.map( p => ({ value: 'p' + p.id, label: p.name, weigth: p.weigth }))
      return tags.concat(places).sort((a, b) => b.weigth-a.weigth)
    },
    showPast: {
      set (value) { this.showPastEvents(value) },
      get () { return this.filters.show_past_events }
    },
    showRecurrent: {
      set (value) { this.showRecurrentEvents(value) },
      get () { return this.filters.show_recurrent_events }
    },
    filter: {
      set (filters) {
        const tags = filters.filter(f => f[0] === 't').map(t => t.slice(1))
        this.setSearchTags(tags)
        const places = filters.filter(f => f[0] === 'p').map(p => +p.slice(1))
        this.setSearchPlaces(places)
      },
      get () {
        return this.filters.tags.map(t => 't' + t).concat(this.filters.places.map(p => 'p' + p))
      }
    },
  }
}
</script>
