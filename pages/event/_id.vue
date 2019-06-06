<template lang="pug">
  el-card#eventDetail(
    visible hide-header 
    no-header :show-close='false' 
    top='0vh !important'
    :appendToBody='true')

    //- close button
    nuxt-link.float-right(to='/')
      el-button(circle  icon='el-icon-close' type='danger' size='small' plain)

    //- title, where, when
    h5.text-center {{event.title}}
    div.nextprev
      nuxt-link(v-if='prev' :to='`/event/${prev.id}`')
        el-button(icon='el-icon-arrow-left' round type='success')
      nuxt-link.float-right(v-if='next' :to='`/event/${next.id}`')
        el-button(icon='el-icon-arrow-right' round type='success') 
  
    //- image
    img(:src='imgPath' v-if='event.image_path')

    .info
      div {{event|event_when}}
      div {{event.place.name}} - {{event.place.address}}

    //- description and tags
    div(v-if='event.description || event.tags')
      pre(v-html='event.description')
      el-tag.mr-1(v-for='tag in event.tags'
        size='mini' :key='tag.tag') {{tag.tag}}

    //- show hide, confirm, delete, edit buttons when allowed
    div(v-if='mine')
      hr
      el-button(v-if='event.is_visible' size='mini' plain type='warning' @click.prevents='toggle' icon='el-icon-view') {{$t('common.hide')}}
      el-button(v-else plain type='success' size='mini' @click.prevents='toggle' icon='el-icon-view') {{$t('common.confirm')}}
      el-button(plain type='danger' size='mini' @click.prevent='remove' icon='el-icon-remove') {{$t('common.remove')}}
      el-button(plain type='primary' size='mini' @click='$router.replace(`/add/${event.id}`)' icon='el-icon-edit') {{$t('common.edit')}}

    //- comments
    .card-body(v-if='event.activitypub_id')
      strong {{$t('common.related')}} - 
      a(:href='`https://mastodon.cisti.org/web/statuses/${event.activitypub_id}`') {{$t('common.add')}}
    .card-header(v-for='comment in event.comments' :key='comment.id')
      img.avatar(:src='comment.data.last_status.account.avatar') 
      strong  {{comment.author}} 
      a.float-right(:href='comment.data.last_status.url')
        small  {{comment.data.last_status.created_at|datetime}}
      div.mt-1(v-html='comment_filter(comment.text)')
      img(v-for='img in comment.data.last_status.media_attachments' :src='img.preview_url')

</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'Event',
  // transition: null,
  // Watch for $route.query.page to call Component methods (asyncData, fetch, validate, layout, etc.)
  // watchQuery: ['id'],
  // Key for <NuxtChild> (transitions)
  // key: to => to.fullPath,
  // Called to know which transition to apply
  // transition(to, from) {
  //   console.log('dentro transition')
  //   if (!from) return 'slide-left'
  //   return +to.params.id < +from.params.id ? 'slide-right' : 'slide-left'
  // },

  head () {
    return {
      title: this.event.title,
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        // { hid: 'description', name: 'description', content: this.event.description },
        // { hid: 'og-description', name: 'og:description', content: this.event.description },
        { hid: 'og-title', property: 'og:title', content: this.event.title },   
        { hid: 'og-url', property: 'og:url', content: `event/${this.event.id}` },   
        { property: 'og:type', content: 'event'},
        { property: 'og:image', content: this.imgPath }
      ]
    }
  },
  computed: {
    ...mapGetters(['filteredEvents']),
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
  async asyncData ( { $axios, params }) {
    const event = await $axios.$get(`/event/${params.id}`)
    return { event, id: params.id}
  },
  methods: {
    ...mapActions(['delEvent']),
    keydown (e) {
      console.error(e)
    },
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
        await this.$axios.delete(`/user/event/${this.id}`)
        this.delEvent(Number(this.id))
        this.$router.back()
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
    font-size: 1.4em;
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

