<template lang="pug">
  b-modal#eventDetail(hide-body hide-header hide-footer @hidden='$router.replace("/")' size='lg' :visible='true')
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
        pre(v-html='event.description')
        br
        el-tag.mr-1(:color='tag.color' v-for='tag in event.tags'
          size='mini') {{tag.tag}}
        .ml-auto(v-if='mine')
          hr
          el-button(plain type='danger' @click.prevent='remove' icon='el-icon-remove') {{$t('Remove')}} 
          el-button(plain type='primary' @click='$router.replace("/edit/"+event.id)') <v-icon color='orange' name='edit'/> {{$t('Edit')}}
    //- b-navbar(type="dark" variant="dark" toggleable='lg')
    //- template(slot='footer')
      //- b-navbar-nav
        //- b-button(variant='success') {{$t('Share')}} <v-icon name='share'/>
        //- b-nav-item( {{$t('')}})
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

export default {
  computed: {
    ...mapState(['user']),
    imgPath () {
      return this.event.image_path && this.event.image_path
    },    
    mine () {
      return this.event.userId === this.user.id || this.user.is_admin
    }
  },
  data () {
    return {
      event: { comments: [], place: {}},
      id: null,
      loading: true,
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
      this.loading = false
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
  width: 100%;
}
</style>

