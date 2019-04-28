<template lang="pug">
  b-modal#eventDetail(ref='eventDetail' hide-body hide-header hide-footer @hidden='$router.replace("/")' size='lg' :visible='true')
    b-card(no-body, :img-src='imgPath' v-loading='loading')
      nuxt-link(to='/')
        el-button.close_button(circle icon='el-icon-close' type='success'
          @click.prevent='$refs.eventDetail.hide()')
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
          size='mini' :key='tag.tag') {{tag.tag}}
        div(v-if='mine')
          hr
          el-button(v-if='event.is_visible' plain type='warning' @click.prevents='toggle' icon='el-icon-view') {{$t('common.hide')}}
          el-button(v-else plain type='success' @click.prevents='toggle' icon='el-icon-view') {{$t('common.confirm')}}
          el-button(plain type='danger' @click.prevent='remove' icon='el-icon-remove') {{$t('common.remove')}} 
          el-button(plain type='primary' @click='$router.replace("/edit/"+event.id)') <v-icon color='orange' name='edit'/> {{$t('common.edit')}}

    //- COMMENTS ... 
    //- b-navbar(type="dark" variant="dark" toggleable='lg')
    //- template(slot='footer')
      //- b-navbar-nav
        //- b-button(variant='success') {{$t('Share')}} <v-icon name='share'/>
        //- b-nav-item( {{$t('')}})
      //- b-card-footer.text-right
        //- span.mr-3 {{event.comments.length}} <v-icon name='comments'/>
        //- a(href='#', @click='remove')
          v-icon(color='orange' name='times')
    //- el-footer(v-for='comment in event.comments')
      strong {{comment.author}}
      div(v-html='comment.text')

    //- el-timeline
    //-   el-timeline-item(v-for='comment in event.comments')
    //-     p(v-html='comment.text')
    //-     a.el-timeline-item__timestamp(href='') {{comment.createdAt}}
    strong {{$t('common.comments')}}
      div.text.item(v-for='comment in event.comments')
        span(v-html='comment.text')
</template>
<script>
import { mapState, mapActions } from 'vuex';
// import api from '@/plugins/api'
//import filters from '@/filters'

export default {
  name: 'Event',
  head () {
    return {
      title: this.event.title,
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        { hid: 'description', name: 'description', content: this.event.description },
        { hid: 'og-description', name: 'og:description', content: this.event.description },
        { hid: 'og-title', property: 'og:title', content: this.event.title },   
        { hid: 'og-url', property: 'og:url', content: `event/${this.event.id}` },   
        { property: 'og:type', content: 'event'},
        { property: 'og:image', content: this.imgPath }
      ]
    }
  },
  computed: {
    ...mapState([]),
    imgPath () {
      return this.event.image_path && '/media/' + this.event.image_path
    },    
    mine () {
      return this.event.userId === this.$auth.user.id || this.$auth.user.is_admin
    }
  },
  data () {
    return {
      event: { comments: [], place: {}, title: ''},
      id: null,
      loading: true,
    }
  },
  // mounted () {
  //   this.id = this.$route.params.id
  //   this.load()
  // },
  async asyncData ( { $axios, params }) {
    console.error('daje dentro asyncData!')
    console.error('async data porcod')
    const event = await $axios.$get(`/event/${params.id}`)
    // this.event = event
    // this.loading = false
    return { event, id: params.id, loading: false }
  },
  methods: {
    ...mapActions(['delEvent']),
    // async load () {
    //   const event = await this.api.getEvent(this.id)
    //   this.event = event
    //   this.loading = false
    // },
    async remove () {
      await api.delEvent(this.event.id)
      this.delEvent(this.event.id)
      this.$refs.eventDetail.hide()
    },
    async toggle () {
      try {
        if (this.event.is_visible) {
          await this.$axios.$get(`/event/unconfirm/${this.id}`)
          this.event.is_visible = false
        } else {
          await this.$axios.$get(`/event/confirm/${this.id}`)
          this.event.is_visible = true
        }
      } catch (e) {

      }
    }
  }
}
</script>
<style>

/* #eventDetail {
  display: block !important;
  opacity: 1;
} */

#eventDetail .modal-body {
  padding: 0px;
  width: 100%;
}

#eventDetail .close_button:hover {
  background-color: rgba(200, 100, 100, 0.4);
}

#eventDetail .card {
  border: 0px;
}

#eventDetail .close_button {
  background-color: rgba(100, 100, 100, 0.4);
  color: red;
  font-size: 20px;
  border: none;
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>

