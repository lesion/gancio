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
        el-tag.mr-1(:color='tag.color' v-for='tag in event.tags'
          size='mini' :key='tag.tag') {{tag.tag}}
        div(v-if='mine')
          hr
          el-button(v-if='event.is_visible' plain type='warning' @click.prevents='toggle' icon='el-icon-view') {{$t('common.hide')}}
          el-button(v-else plain type='success' @click.prevents='toggle' icon='el-icon-view') {{$t('common.confirm')}}
          el-button(plain type='danger' @click.prevent='remove' icon='el-icon-remove') {{$t('common.remove')}} 
          el-button(plain type='primary' @click='$router.replace("/edit/"+event.id)') <v-icon color='orange' name='edit'/> {{$t('common.edit')}}

    b-card-body(v-if='event.activitypub_id')
      strong {{$t('common.resources')}} - 
      a(:href='`https://mastodon.cisti.org/web/statuses/${event.activitypub_id}`') {{$t('common.add')}}
    b-card-header(v-for='comment in event.comments' :key='comment.id')
      img.avatar(:src='comment.data.last_status.account.avatar') 
      strong  {{comment.author}} 
      a.float-right(:href='comment.data.last_status.url')
        small  {{comment.data.last_status.created_at|datetime}}
      div.mt-1(v-html='comment_filter(comment.text)')
      img(v-for='img in comment.data.last_status.media_attachments' :src='img.preview_url')
      //- span {{comment}}
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
    },
  },
  data () {
    return {
      event: { comments: [], place: {}, title: ''},
      id: null,
      loading: true,
    }
  },
  async asyncData ( { $axios, params }) {
    const event = await $axios.$get(`/event/${params.id}`)
    return { event, id: params.id, loading: false }
  },
  methods: {
    ...mapActions(['delEvent']),
    comment_filter (value) {
      console.log('dentro comment_filter')
      return value.replace(/<a.*href="([^">]+).*>(?:.(?!\<\/a\>))*.<\/a>/, (orig, url) => {
        // get extension
        const ext = url.slice(-4)
        console.log('dentro il replace ', ext)
        if (['.mp3', '.ogg'].indexOf(ext)>-1) {
          return `<audio controls><source src='${url}'></audio>`
        } else {
          return orig
        }
      })
    },
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

#eventDetail .avatar {
  height: 40px;
  border-radius: 5px;
}

#eventDetail .image {
  max-height: 200px;
}

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
  background-color: rgba(100, 100, 100, 0.3);
  color: red;
  font-size: 20px;
  border: 1px dashed rgba(20,20,20,0.3);
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>

