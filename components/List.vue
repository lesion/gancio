<template lang="pug">
  div#gancio-widget
    //- el-card.mb-1(no-body header='Eventi')
    //- b-list-group#list(flush)
    p minimal {{minimal}}
    ul
      li.flex-column.align-items-start(v-for="event in events" :key='event.id'
          :to='`/event/${event.id}`' target='_parent')
          img(v-if='event.image_path' slot="aside" :src="`http://localhost:3000/media/${event.image_path}`" alt="Meia Aside" style='max-height: 60px')
          strong.mb-1 {{event.title}}
          br
          small.float-right {{event.place.name}}
          //- el-tag.mr-1(v-if='showtags' :color='tag.color || "rgba(64,158,255,.1)"' size='mini' v-for='tag in event.tags' :key='tag.tag') {{tag.tag}}    
</template>
<script>
import axios from 'axios'
export default {
  name: 'List',
  data () {
    return {
      events: []
    }
  },
  props: {
    minimal: {
      type: Boolean,
      default: false
    }
  },
  async mounted () {
    this.events = (await axios.get('http://localhost:3000/api/export/json')).data
  }
}
</script>