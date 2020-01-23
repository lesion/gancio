<template lang="pug">
  el-container#eventDetail
    el-header

      span.title {{event.title}}

      #arrow
        nuxt-link.mr-1(:to='`/event/${prev}`')
          el-button(circle plain size='small' icon='el-icon-arrow-left' :disabled='!prev')
        nuxt-link(:to='`/event/${next}`')
          el-button(circle plain size='small' :disabled='!next' icon='el-icon-arrow-right')
    el-main
      el-dialog.embedDialog(:visible.sync='showEmbed')
        h4(slot='title') {{$t('common.embed_title')}}
        EmbedEvent(:event='event')

      el-row
        el-col(:sm='18' :xs="24")

          //- event image
          el-image.main_image.mb-3(:src='imgPath' v-if='event.image_path' fit='contain')
            div.loading(slot='placeholder')
              el-icon(name='loading')

          pre(v-html='event.description')
          el-tag.mr-1.mb-1(v-for='tag in event.tags'
            size='mini' :key='tag') {{tag}}

        //- info & actions for desktop
        el-col.menu(:sm='6' :xs='24')
          el-menu.menu.mt-2(router)
            p <i class='el-icon-time'></i>  <b>{{event|when}}</b> <br/><small>{{event|to}}</small>
            p <i class='el-icon-map-location'></i>  <b>{{event.place.name}}</b> - {{event.place.address}}
            el-divider {{$t('common.actions')}}
            el-menu-item(
              v-clipboard:success='copyLink'
              v-clipboard:copy='`${settings.baseurl}/event/${event.id}`') <i class='el-icon-paperclip'></i> {{$t('common.copy_link')}}

            el-menu-item(@click='showEmbed=true') <i class='el-icon-copy-document'></i> {{$t('common.embed')}}

            //- TODO (ics of recurrent events)
            el-menu-item(v-if='!event.recurrent')
              a(:href='`${settings.baseurl}/api/event/${event.id}.ics`') <i class='el-icon-date'></i> {{$t('common.add_to_calendar')}}
          EventAdmin(v-if='is_mine' :event='event')

      hr

      //- resources from fediverse
      #resources.mt-1(v-if='settings.enable_federation')
        div.float-right(v-if='!settings.hide_boosts')
          small.mr-3 🔖 {{event.likes.length}}
          small ✊ {{event.boost.length}}<br/>

        strong(v-if='settings.enable_resources') {{$tc('common.resources', event.resources.length)}} -
        small {{$t('event.interact_with_me_at')}}
          el-button(type='text' size='mini' @click='showFollowMe=true') @{{settings.instance_name}}@{{settings.baseurl|url2host}}

        el-dialog.followDialog(:visible.sync='showFollowMe')
          h4(slot='title') {{$t('common.follow_me_title')}}
          FollowMe

        .card-header(v-if='settings.enable_resources' v-for='resource in event.resources' :key='resource.id' :class='{disabled: resource.hidden}')
          a.float-right(:href='resource.data.url')
            small {{resource.data.published|datetime}}
          div.mt-1(v-html='resource_filter(resource.data.content)')
          img(v-for='img in resource.data.media_attachments' :src='img.url')
          el-dropdown
            el-button(type="primary" icon="el-icon-arrow-down" size='mini') {{$t('common.moderation')}}
            el-dropdown-menu(slot='dropdown')
              el-dropdown-item(v-if='!resource.hidden' icon='el-icon-remove' @click.native='hideResource(resource, true)') {{$t('admin.hide_resource')}}
              el-dropdown-item(v-else icon='el-icon-success' @click.native='hideResource(resource, false)') {{$t('admin.show_resource')}}
              el-dropdown-item(icon='el-icon-delete' @click.native='deleteResource(resource)') {{$t('admin.delete_resource')}}
              el-dropdown-item(icon='el-icon-lock' @click.native='blockUser(resource)') {{$t('admin.block_user')}}

</template>
<script>
import { mapState, mapGetters } from 'vuex'
import EventAdmin from './eventAdmin'
import EmbedEvent from './embedEvent'
import FollowMe from './followMe'
import { Message, MessageBox } from 'element-ui'

import moment from 'dayjs'

export default {
  name: 'Event',
  transition: null,
  components: { EventAdmin, EmbedEvent, FollowMe },
  async asyncData ({ $axios, params, error, store }) {
    try {
      const [id, start_datetime] = params.id.split('_')
      const event = await $axios.$get(`/event/${id}`)
      event.start_datetime = start_datetime
        ? Number(start_datetime)
        : event.start_datetime
      // const now = new Date()
      // const events = await $axios.$get(
      // `/event/${now.getMonth()}/${now.getFullYear()}`
      // )
      // store.commit('setEvents', events)
      return { event, id: Number(id) }
    } catch (e) {
      error({ statusCode: 404, message: 'Event not found' })
    }
  },
  data () {
    return {
      showEmbed: false,
      showFollowMe: false
    }
  },
  head () {
    if (!this.event) {
      return {}
    }
    const tags_feed = this.event.tags.map(tag => ({
      rel: 'alternate',
      type: 'application/rss+xml',
      title: `${this.settings.title} events tagged ${tag}`,
      href: this.settings.baseurl + `/feed/rss?tags=${tag}`
    }))
    const place_feed = {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: `${this.settings.title} events  @${this.event.place.name}`,
      href: this.settings.baseurl + `/feed/rss?places=${this.event.placeId}`
    }

    return {
      title: `${this.settings.title} - ${this.event.title}`,
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: 'description',
          name: 'description',
          content: this.event.description.replace('\n', '').slice(0, 1000)
        },
        {
          hid: 'og-description',
          name: 'og:description',
          content: this.event.description.replace('\n', '').slice(0, 100)
        },
        { hid: 'og-title', property: 'og:title', content: this.event.title },
        {
          hid: 'og-url',
          property: 'og:url',
          content: `${this.settings.baseurl}/event/${this.event.id}`
        },
        { property: 'og:type', content: 'event' },
        {
          property: 'og:image',
          content: this.thumbImgPath
        },
        { property: 'og:site_name', content: this.settings.title },
        {
          property: 'og:updated_time',
          content: moment.unix(this.event.start_datetime).format()
        },
        {
          property: 'article:published_time',
          content: moment.unix(this.event.start_datetime).format()
        },
        { property: 'article:section', content: 'event' },
        { property: 'twitter:card', content: 'summary' },
        { property: 'twitter:title', content: this.event.title },
        {
          property: 'twitter:image',
          content: this.thumbImgPath
        },
        {
          property: 'twitter:description',
          content: this.event.description.replace('\n', '').slice(0, 100)
        }
      ],
      link: [
        { rel: 'image_src', href: this.thumbImgPath },
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: this.settings.title,
          href: this.settings.baseurl + '/feed/rss'
        },
        ...tags_feed,
        place_feed
      ]
    }
  },
  computed: {
    ...mapGetters(['filteredEvents']),
    ...mapState(['settings']),
    next () {
      let found = false
      const event = this.filteredEvents.find(e => {
        if (found) {
          return e
        }
        found =
          e.start_datetime === this.event.start_datetime &&
          e.id === this.event.id
      })
      if (!event) {
        return false
      }
      if (event.recurrent) {
        return `${event.id}_${event.start_datetime}`
      }
      return event.id
    },
    prev () {
      let event = false
      this.filteredEvents.find(e => {
        if (
          e.start_datetime === this.event.start_datetime &&
          e.id === this.event.id
        ) {
          return true
        }
        event = e
      })
      if (!event) {
        return false
      }
      if (event.recurrent) {
        return `${event.id}_${event.start_datetime}`
      }
      return event.id
    },
    imgPath () {
      return '/media/' + this.event.image_path
    },
    thumbImgPath () {
      if (this.event.image_path) {
        return this.settings.baseurl + '/media/thumb/' + this.event.image_path
      } else {
        return this.settings.baseurl + '/logo.png'
      }
    },
    is_mine () {
      if (!this.$auth.user) {
        return false
      }
      return (
        this.event.userId === this.$auth.user.id || this.$auth.user.is_admin
      )
    }
  },
  methods: {
    async remove () {
      try {
        await MessageBox.confirm(this.$t('event.remove_confirmation'), this.$t('common.confirm'), {
          confirmButtonText: this.$t('common.ok'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'error'
        })
        await this.$axios.delete(`/user/event/${this.event.id}`)
        this.delEvent(Number(this.event.id))
        this.$router.replace('/')
      } catch (e) {
        console.error(e)
      }
    },
    async toggle () {
      try {
        if (this.event.is_visible) {
          await this.$axios.$get(`/event/unconfirm/${this.event.id}`)
          this.event.is_visible = false
        } else {
          await this.$axios.$get(`/event/confirm/${this.event.id}`)
          this.event.is_visible = true
        }
      } catch (e) {
        console.error(e)
      }
    },
    async hideResource (resource, hidden) {
      await this.$axios.$put(`/resources/${resource.id}`, { hidden })
      resource.hidden = hidden
    },
    async blockUser (resource) {
      await this.$axios.post('/instances/toggle_user_block', { user_id: resource.apUserApId })
      Message({ message: this.$t('admin.user_blocked', { user: resource.apUserApId }), type: 'success', showClose: true })
    },
    deleteResource (resource) {
      MessageBox.confirm(this.$t('admin.delete_resource_confirm'),
        this.$t('common.confirm'), {
          confirmButtonText: this.$t('common.ok'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'error'
        }).then(async () => {
        await this.$axios.delete(`/resources/${resource.id}`)
        this.event.resources = this.event.resources.filter(r => r.id !== resource.id)
      })
    },
    copyLink () {
      Message({ message: this.$t('common.copied'), type: 'success', showClose: true })
    },
    resource_filter (value) {
      return value.replace(
        /<a.*href="([^">]+).*>(?:.(?!<\/a>))*.<\/a>/,
        (orig, url) => {
          // get extension
          const ext = url.slice(-4)
          if (['.mp3', '.ogg'].includes(ext)) {
            return `<audio controls><source src='${url}'></audio>`
          } else {
            return orig
          }
        }
      )
    }
  }
}
</script>
<style lang='less'>
#eventDetail {

  #arrow {
    position: absolute;
    top: 1em;
    right: 1em;
  }

  .el-header {
    position: sticky;
    padding-top: 1em;
    top: 0px;
    border-bottom: 1px solid lightgray;
    z-index: 1;
  }

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
    background-color: transparent;
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
    padding-right: 40px;
  }

  pre {
    white-space: pre-line;
    word-break: break-word;
    color: #404246;
    font-size: 1em;
    font-family: inherit;
    // font-family: BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Oxygen,
      // Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, Helvetica, Arial,
      // sans-serif !important;
  }

  .main_image {
    width: 100%;
    transition: height .100s;
    height: auto;

    img {
      // object-fit: contain;
      margin: 0 auto;
      max-height: 88vh;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 30px;
      margin: 0 auto;
      height: 100px;
    }
  }

  #resources {
    img {
      max-width: 100%;
    }
    .card-header {
      border-left: 3px solid transparent;
    }
    .card-header:hover {
      border-left: 3px solid #888;
    }
    .invisible {
      visibility: visible !important;
    }
    .disabled {
      opacity: 0.5;
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

    .title {
      font-size: 1em;
      font-weight: bold;
    }
  }
}
</style>
