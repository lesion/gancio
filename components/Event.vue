<template lang="pug">
  b-card(bg-variant='dark' text-variant='white' :class="{ withImg: event.image_path ? true : false }"
    @click='$router.push("/event/" + event.id)'
     :img-src='imgPath')
      strong {{event.title}}
      div <v-icon name='clock'/> {{event.start_datetime|datetime}}
      //- span <v-icon name='map-marker-alt'/> {{event.place.name}}
      br
      el-tag.mr-1(:color='tag.color || "grey"' v-for='tag in event.tags' :key='tag.tag'
        size='small' @click.stop='addSearchTag(tag)') {{tag.tag}}
</template>
<script>
import { mapState, mapActions } from 'vuex'
// import api from '@/server/api'
// import filters from '@/filters'

export default {
  props: ['event'],
  computed: {
    ...mapState(['user']),
    imgPath() {
      return this.event.image_path && '/uploads/thumb/' + this.event.image_path
    },
    mine() {
      return this.event.userId === this.user.id
    }
  },
  // filters: {
  //   datetime: this.datetime
  // },
  methods: {
    ...mapActions(['delEvent', 'addSearchTag']),
    async remove() {
      // await api.delEvent(this.event.id)
      // this.delEvent(this.event.id)
    }
  }
}
</script>
<style scoped>
/* .card::before {
  border-top: 4px solid black;
  content: ''
} */

.el-card {
  border: none;
}

.el-card img {
  width: 100%;
}

.card-columns .card {
  margin-top: 0.2em;
  margin-bottom: 0em;
}

.card-img {
  height: 180px;

  object-fit: cover;
}
</style>
