<template lang="pug">
  b-card(bg-variant='dark' text-variant='white'
    @click='$router.push("/event/" + event.id)'
     :img-src='imgPath')
      h5 {{event.title}}
      div <v-icon name='clock'/> {{event.start_datetime|datetime}}
      span(v-b-popover.hover="event.place && event.place.address || ''")  <v-icon name='map-marker-alt'/> {{event.place.name}}
      br
      b-badge(:style='{backgroundColor: tag.color}' v-for='tag in event.tags' href='#' 
        @click.stop='addSearchTag(tag)') {{tag.tag}}
</template>
<script>
import { mapState, mapActions } from 'vuex';
import api from '@/api'
import filters from '@/filters'
import config from '../../config'

export default {
  props: ['event'],
  computed: {
    ...mapState(['user']),
    imgPath () {
      return this.event.image_path && config.apiurl + '/../' + this.event.image_path
    },
    mine () {
      return this.event.userId === this.user.id
    }
  },
  filters,
  methods: {
    ...mapActions(['delEvent', 'addSearchTag']),
    async remove () {
      await api.delEvent(this.event.id)
      this.delEvent(this.event.id)
    }
  }
}
</script>
<style scoped>

/* .card::before {
  border-top: 4px solid black;
  content: ''
} */

.card-columns .card {
  margin-top: 0.3em;
  margin-bottom: 0em;
}

.card-img {
  max-height: 180px;
  object-fit: cover;
}

.badge {
  margin-left: 0.1rem;
}
</style>

