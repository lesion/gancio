<template lang="pug">
  el-main#eventDetail

    .head
      nuxt-link.mr-2(to='/')
        img#logo(src='/favicon.ico')

      span.title {{event.title}}

      div.float-right
        nuxt-link.mr-1(:to='`/event/${prev}`')
          el-button(circle plain size='small' icon='el-icon-arrow-left' :disabled='!prev')
        nuxt-link(:to='`/event/${next}`')
          el-button(circle plain size='small' :disabled='!next' icon='el-icon-arrow-right')

    el-row
      el-col(:md='18')
        //- event image
        img.main.mb-3(:src='imgPath' v-if='event.image_path')
        //- info for mobile screen
        div.d-block.d-lg-none
          span <b>{{event|when}}</b>, <small>{{event|to}}</small><br/>
          span <b>{{event.place.name}}</b> - {{event.place.address}}
          hr
        pre(v-html='$options.filters.linkify(event.description)')
        el-tag.mr-1.mb-1(v-for='tag in event.tags'
          size='mini' :key='tag') {{tag}}

      //- info & actions for desktop
      el-dialog.embedDialog(:visible.sync='showEmbed')
        h4(slot='title') {{$t('common.embed_title')}}
        EmbedEvent(:event='event')
      el-col.d-none.d-lg-block(:md='6')
        el-menu.menu.mt-2
          p <i class='el-icon-watch'></i>  <b>{{event|when}}</b> <br/><small>{{event|to}}</small>
          p <i class='el-icon-map-location'></i>  <b>{{event.place.name}}</b> - {{event.place.address}}
          el-divider {{$t('common.actions')}}
          el-menu-item(
            v-clipboard:success='copyLink'
            v-clipboard:copy='`${settings.baseurl}/event/${event.id}`') <i class='el-icon-paperclip'></i> {{$t('common.copy_link')}}

          el-menu-item(@click='showEmbed=true') <i class='el-icon-copy-document'></i> {{$t('common.embed')}}

          //- TODO (ics of recurrent events)
          el-menu-item(v-if='!event.recurrent')
            a.d-block(:href='`${settings.baseurl}/api/event/${event.id}.ics`') <i class='el-icon-date'></i> {{$t('common.add_to_calendar')}}
          EventAdmin(v-if='is_mine' :event='event')
    hr

    .d-block.d-lg-none
      el-button(plain size='mini' type='primary' v-clipboard:success='copyLink'
        v-clipboard:copy='`${settings.baseurl}/event/${event.id}`') <i class='el-icon-paperclip'></i> {{$t('common.copy_link')}}
      a.el-button.el-button--success.el-button--mini.is-plain(role='button' plain size='mini' type='success'
        :href='`${settings.baseurl}/api/event/${event.id}.ics`') <i class='el-icon-date'></i> {{$t('common.add_to_calendar')}}

    //- comments from fediverse
    #comments.mt-1(v-if='settings.enable_federation')
      div.float-right(v-if='!settings.disable_gamification')
        small.mr-3 🔖 {{event.likes.length}}
        small ✊ {{event.boost.length}}<br/>

      strong(v-if='settings.enable_comments') {{$tc('common.comments', event.comments.length)}} -
      small {{$t('event.interact_with_me_at')}} 
        el-button(type='text' size='mini' @click='showFollowMe=true') @{{fedi_user}}@{{settings.baseurl|url2host}}

      el-dialog.followDialog(:visible.sync='showFollowMe')
        h4(slot='title') {{$t('common.follow_me_title')}}
        FollowMe

      .card-header(v-if='settings.enable_comments' v-for='comment in event.comments' :key='comment.id')
        a.float-right(:href='comment.data.url')
          small {{comment.data.published|datetime}}
        div.mt-1(v-html='comment_filter(comment.data.content)')
        img(v-for='img in comment.data.media_attachments' :src='img.url')

</template>
<script>
import { mapState, mapGetters } from 'vuex'
import EventAdmin from './eventAdmin'
import EmbedEvent from './embedEvent'
import FollowMe from './followMe'
import { Message } from 'element-ui'

import moment from 'dayjs'

export default {
  name: 'Event',
  transition: null,
  components: { EventAdmin, EmbedEvent, FollowMe },
  data() {
    return {
      showEmbed: false,
      showFollowMe: false
    }
  },
  head () {
    if (!this.event) { return {} }
    const tags_feed = this.event.tags.map(tag => ({ rel: 'alternate',
      type: 'application/rss+xml',
      title: `${this.settings.title} events tagged ${tag}`,
      href: this.settings.baseurl + `/feed/rss?tags=${tag}` }))
    const place_feed = { rel: 'alternate',
      type: 'application/rss+xml',
      title: `${this.settings.title} events  @${this.event.place.name}`,
      href: this.settings.baseurl + `/feed/rss?places=${this.event.placeId}` }

    return {
      title: `${this.settings.title} - ${this.event.title}`,
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        { hid: 'description',
          name: 'description',
          content: this.event.description.replace('\n', '').slice(0, 1000) },
        { hid: 'og-description',
          name: 'og:description',
          content: this.event.description.replace('\n', '').slice(0, 100) },
        { hid: 'og-title', property: 'og:title', content: this.event.title },
        { hid: 'og-url', property: 'og:url', content: `${this.settings.baseurl}/event/${this.event.id}` },
        { property: 'og:type', content: 'event' },
        { property: 'og:image', content: `${this.settings.baseurl}${this.imgPath}` },
        { property: 'og:site_name', content: this.settings.title },
        { property: 'og:updated_time', content: moment.unix(this.event.start_datetime).format() },
        { property: 'article:published_time', content: moment.unix(this.event.start_datetime).format() },
        { property: 'article:section', content: 'event' },
        { property: 'twitter:card', content: 'summary' },
        { property: 'twitter:title', content: this.event.title },
        { property: 'twitter:image', content: `${this.settings.baseurl}${this.imgPath}` },
        { property: 'twitter:description', content: this.event.description.replace('\n', '').slice(0, 100) }
      ],
      link: [
        { rel: 'image_src', href: `${this.settings.baseurl}${this.imgPath}` },
        { rel: 'alternate', type: 'application/rss+xml', title: this.settings.title, href: this.settings.baseurl + '/feed/rss' },
        ...tags_feed,
        place_feed
      ]
    }
  },
  async asyncData ({ $axios, params, error, store }) {
    try {
      const [ id, start_datetime ] = params.id.split('_')
      const event = await $axios.$get(`/event/${id}`)
      event.start_datetime = start_datetime ? Number(start_datetime) : event.start_datetime
      const now = new Date()
      const events = await $axios.$get(`/event/${now.getMonth()}/${now.getFullYear()}`)
      store.commit('setEvents', events)
      return { event, id: Number(id) }
    } catch (e) {
      error({ statusCode: 404, message: 'Event not found' })
    }
  },
  computed: {
    ...mapGetters(['filteredEvents']),
    ...mapState(['settings']),
    fedi_user () {
      // TODO:
      return this.settings.fedi_admin
    },
    next () {
      let found = false
      const event = this.filteredEvents.find(e => {
        if (found) { return e }
        found = (e.start_datetime === this.event.start_datetime && e.id === this.event.id)
      })
      if (!event) { return false }
      if (event.recurrent) {
        return `${event.id}_${event.start_datetime}`
      }
      return event.id
    },
    prev () {
      let event = false
      this.filteredEvents.find(e => {
        if (e.start_datetime === this.event.start_datetime && e.id === this.event.id) { return true }
        event = e
      })
      if (!event) { return false }
      if (event.recurrent) {
        return `${event.id}_${event.start_datetime}`
      }
      return event.id
    },
    imgPath () {
      return this.event.image_path && '/media/' + this.event.image_path
    },
    is_mine () {
      if (!this.$auth.user) { return false }
      return this.event.userId === this.$auth.user.id || this.$auth.user.is_admin
    }
  },
  methods: {
    copyLink () {
      Message({ message: this.$t('common.copied'), type: 'success' })
    },
    comment_filter (value) {
      return value.replace(/<a.*href="([^">]+).*>(?:.(?!<\/a>))*.<\/a>/, (orig, url) => {
        // get extension
        const ext = url.slice(-4)
        if (['.mp3', '.ogg'].includes(ext)) {
          return `<audio controls><source src='${url}'></audio>`
        } else {
          return orig
        }
      })
    }
  }
}
</script>
<style lang='less'>

#eventDetail {
  background-color: white;
  margin-bottom: 30px;
  padding-top: 0px;

  .embedDialog {
    .el-dialog {
      min-height: 500px;
      max-width: 1000px;
      width: 100%;
    }
  }

  .followDialog {
    .el-dialog {
      min-height: 300px;
      max-width: 600px;
      width: 100%;
    }
  }

  .head {
    z-index: 1;
    position: sticky;
    top: 0px;
    padding-top: 10px;
    padding-bottom: 10px;
    background-color: white;
    border-bottom: 1px solid #e6e6e6;
  }

  .menu {
    border-right: none;
    border-left: 1px solid #e6e6e6;
    p {
      margin-left: 10px;
    }
  }

  .title {
    max-width: 80%;
    max-height: 0.1rem;
    overflow: hidden;
    font-size: 1.6rem;
    color: #404246;
    line-height: 1;
  }

  pre {
    color: #404246;
    font-size: 1em;
    font-family: BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,Helvetica,Arial,sans-serif !important;
  }

  img {
    max-height: 88vh;
    object-fit: contain;
    &.main {
      width: 100%;
    }
  }

  #comments {
    img {
      max-width: 100%;
    }
    .invisible {
      visibility: visible !important;
    }
  }
  .nextprev {
    font-size: 10px;
    margin-bottom: 5px;
  }
}

@media only screen and (max-width: 768px) {
  #eventDetail {
    .menu {
      border: 0px;
    }
  }
}

</style>
