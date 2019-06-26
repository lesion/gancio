<template lang="pug">
  el-card#eventDetail(v-loading='!loaded')
    //- close button
    nuxt-link.float-right(to='/')
      v-icon(name='times' color='red')

    div(v-if='!event')
      h5 {{$t('event.not_found')}}

    div(v-else)
      //- title, where, when
      h5.text-center {{event.title}}
      div.nextprev
        nuxt-link(v-if='prev' :to='`/event/${prev.id}`')
          el-button( type='success' size='mini')
            v-icon(name='chevron-left')
        nuxt-link.float-right(v-if='next' :to='`/event/${next.id}`')
          el-button(type='success' size='mini')
            v-icon(name='chevron-right')
    
      //- image
      img(:src='imgPath' v-if='event.image_path' @load='image_loaded')

      .info
        div {{event|event_when}}
        div {{event.place.name}} - {{event.place.address}}

      //- description and tags
      div(v-if='event.description || event.tags')
        pre(v-html='$options.filters.linkify(event.description)')
        el-tag.mr-1(v-for='tag in event.tags'
          size='mini' :key='tag.tag') {{tag.tag}}

      //- show hide, confirm, delete, edit buttons when allowed
      div(v-if='mine')
        hr
        el-button(v-if='event.is_visible' size='mini' plain type='warning' @click.prevents='toggle') {{$t('common.hide')}}
        el-button(v-else plain type='success' size='mini' @click.prevents='toggle') {{$t('common.confirm')}}
        el-button(plain type='danger' size='mini' @click.prevent='remove') {{$t('common.remove')}}
        el-button(plain type='primary' size='mini' @click='$router.replace(`/add/${event.id}`)') {{$t('common.edit')}}  

      //- comments
      .card-body(v-if='event.activitypub_id && settings')
        strong {{$t('common.related')}} - 
        a(:href='`https://${settings.mastodon_instance}/web/statuses/${event.activitypub_id}`') {{$t('common.add')}}
      .card-header(v-for='comment in event.comments' :key='comment.id')
        img.avatar(:src='comment.data.last_status.account.avatar') 
        strong  {{comment.author}} 
        //- a.float-right(:href='comment.data.last_status.url')
        a.float-right(:href='`https://${settings.mastodon_instance}/web/statuses/${comment.data.last_status.id}`')
          small  {{comment.data.last_status.created_at|datetime}}
        div.mt-1(v-html='comment_filter(comment.data.last_status.content)')
        img(v-for='img in comment.data.last_status.media_attachments' :src='img.url')

</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { MessageBox } from 'element-ui'

export default {
  name: 'Event',
  data () {
    return {
      loaded: false,
    }
  },
  // transition: null,
  // Watch for $route.query.page to call Component methods (asyncData, fetch, validate, layout, etc.)
  // watchQuery: ['id'],
  // Key for <NuxtChild> (transitions)
  // key: to => to.fullPath,
  // Called to know which transition to apply
  // transition(to, from) {
  //   if (!from) return 'slide-left'
  //   return +to.params.id < +from.params.id ? 'slide-right' : 'slide-left'
  // },

  head () {
    if (!this.event) return {}
    return {
      title: this.event.title,
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        { hid: 'description', name: 'description', content: this.event.description.slice(0, 1000) },
        { hid: 'og-description', name: 'og:description', content: this.event.description.slice(0, 100) },
        { hid: 'og-title', property: 'og:title', content: this.event.title },   
        { hid: 'og-url', property: 'og:url', content: `event/${this.event.id}` },   
        { property: 'og:type', content: 'event'},
        { property: 'og:image', content: this.imgPath }
      ]
    }
  },
  async fetch ({ $axios, store }) {
    try {
      const now = new Date()
      const events = await $axios.$get(`/event/${now.getMonth()}/${now.getFullYear()}`)
      return store.commit('setEvents', events)
    } catch(e) {
      console.error(e)
    }    
  },
  async asyncData ( { $axios, params }) {
    const event = await $axios.$get(`/event/${params.id}`)
    const loaded = !event.image_path
    return { event, id: params.id, loaded }
  },  
  computed: {
    ...mapGetters(['filteredEvents']),
    ...mapState(['settings']),
    next () {
      let found = false
      return this.filteredEvents.find(e => {
        if (found) return e
        if (e.id === this.event.id) found = true
      })
    },   
    prev () {
      let prev = false
      this.filteredEvents.find(e => {
        if (e.id === this.event.id) return true
        prev = e
      })
      return prev
    },
    imgPath () {
      return this.event.image_path && '/media/' + this.event.image_path
    },    
    mine () {
      if (!this.$auth.user) return false
      return this.event.userId === this.$auth.user.id || this.$auth.user.is_admin
    },
  },
  methods: {
    image_loaded (e, b) {
      this.loaded = true
    },
    ...mapActions(['delEvent']),
    comment_filter (value) {
      return value.replace(/<a.*href="([^">]+).*>(?:.(?!\<\/a\>))*.<\/a>/, (orig, url) => {
        // get extension
        const ext = url.slice(-4)
        if (['.mp3', '.ogg'].indexOf(ext)>-1) {
          return `<audio controls><source src='${url}'></audio>`
        } else {
          return orig
        }
      })
    },
    async remove () {
      try {
        await MessageBox.confirm(this.$t('event.remove_confirmation'), this.$t('common.confirm'), {
          confirmButtonText: this.$t('common.ok'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'error'})
        await this.$axios.delete(`/user/event/${this.id}`)
        this.delEvent(Number(this.id))
        this.$router.replace("/")
      } catch (e) {
        console.error(e)
      }
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
        console.error(e)
      }
    }
  }
}
</script>
<style lang='less'>

#eventDetail {
  max-width: 1000px;
  border-radius: 0px;
  margin: 0 auto;

  pre {
    color: #404246;
    font-size: 1em;
    font-family: BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,Helvetica,Arial,sans-serif !important;
  }

  h5 {
    font-size: 2em;
    font-weight: 600;
    min-height: 40px;
  }

  .info {
    margin: 10px;
    font-size: 1.3em;
    font-weight: 600;
    text-align: center;
  }

  img {
    width: 100%;
    max-height: 89vh;
    object-fit: contain;
  }

  .avatar {
    width: auto;
    height: 40px;
    border-radius: 5px;
  }

  .nextprev {
    font-size: 10px;
    margin-bottom: 5px;
  }
}

@media only screen and (max-width: 768px) {
  #eventDetail {
    font-size: 12px;
  }
}

</style>

