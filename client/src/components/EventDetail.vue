<template lang="pug">
  b-modal#eventDetail(hide-footer hide-header
    @hide='$router.go(-1)' size='lg' :visible='true')

    b-card(bg-variant='dark' href='#' text-variant='white' 
      no-body, :img-src='imgPath')
      b-card-header 
        h3 {{event.title}}
        v-icon(name='clock')
        span  {{event.start_datetime|datetime}}
        br
        v-icon(name='map-marker-alt')
        span  {{event.place.name}} - {{event.place.address}}
        br
      b-card-body(v-if='event.description || event.tags')
        pre {{event.description}}
        br
        b-badge(:style='{backgroundColor: tag.color}' v-for='tag in event.tags') {{tag.tag}}
      b-navbar(v-if='mine' type="dark" variant="dark" toggleable='lg')
        b-navbar-nav.ml-auto
          b-nav-item(@click.prevent='remove') <v-icon color='red' name='times'/> {{$t('Remove')}} 
          b-nav-item(:to='"/edit/"+event.id') <v-icon color='orange' name='edit'/> {{$t('Edit')}}
      //- b-card-footer.text-right
        //- span.mr-3 {{event.comments.length}} <v-icon name='comments'/>
        //- a(href='#', @click='remove')
          v-icon(color='orange' name='times')
      //- b-card-footer(v-for='comment in event.comments')
        strong {{comment.author}}
        div(v-html='comment.text')
</template>
<script>
import { mapState, mapActions } from 'vuex';
import api from '@/api'
import filters from '@/filters'
import config from '../../config'

export default {
  computed: {
    ...mapState(['user']),
    imgPath () {
      return this.event.image_path && config.apiurl + '/../' + this.event.image_path
    },    
    mine () {
      return this.event.userId === this.user.id || this.user.is_admin
    }
  },
  data () {
    return {
      event: { comments: [], place: {}},
      id: null,
    }
  },
  mounted () {
    this.id = this.$route.params.id
    this.load()
  },
  filters: filters,
  methods: {
    ...mapActions(['delEvent']),
    async load () {
      const event = await api.getEvent(this.id)
      this.event = event
    },
    async remove () {
      await api.delEvent(this.event.id)
      this.delEvent(this.event.id)
      this.$router.go(-1)
    }
  }
}
</script>
<style>
#eventDetail .modal-body {
  padding: 0px;
}

/* .card::before {
  border-top: 4px solid black;
  content: ''
} */
#eventDetail .card {
  margin-left: -5px;
}
/* #eventDetail .card-img {
  max-height: 150px;
  object-fit: cover;
} */
#eventDetail .badge {
  margin-left: 0.1rem;
}
</style>

