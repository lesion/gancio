<template lang="pug">
  el-container#eventDetail.h-event
    el-header

      span.title.p-summary.p-name {{event.title}}

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
        el-col.p-2(:sm='18' :xs="24")

          //- event image
          el-image.main_image.mb-3(:src='imgPath' v-if='event.image_path' fit='contain')
            div.loading(slot='placeholder')
              el-icon(name='loading')

          pre.p-description(v-html='event.description')
          el-button.p-category.ml-1.text-primary(plain round size='mini' v-for='tag in event.tags' :key='tag') {{tag}}

        //- info & actions
        el-col.menu(:sm='6' :xs='24')
          el-menu.menu(router)
            time.dt-start(:datetime='event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")') <i class='el-icon-date'></i>  <b>{{event|when}}</b> <br/><small>{{event.start_datetime|to}}</small>
            p
              i.el-icon-location-outline
              b.p-location {{event.place.name}}
              span  - {{event.place.address}}
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

        p.p-2
          el-button(type='text' @click='showFollowMe=true') {{$t('event.interact_with_me')}}
          span(v-if='settings.enable_resources && event.resources.length')  -  {{$tc('common.n_resources', event.resources.length)}}

        el-dialog(:visible.sync='showFollowMe' destroy-on-close)
          h4(slot='title') {{$t('common.follow_me_title')}}
          FollowMe

        el-dialog.showResource#resourceDialog(:visible.sync='showResources' fullscreen
          width='95vw'
          destroy-on-close
          @keydown.native.right='$refs.carousel.next()'
          @keydown.native.left='$refs.carousel.prev()')
          el-carousel(:interval='10000' ref='carousel' arrow='always')
            el-carousel-item(v-for='attachment in selectedResource.data.attachment' :key='attachment.url')
              el-image(:src='attachment.url')
        el-card.mb-1(v-if='settings.enable_resources' v-for='resource in event.resources' :key='resource.id' :class='{disabled: resource.hidden}')
          span
            el-dropdown.mr-2(v-if='$auth.user && $auth.user.is_admin')
              el-button(circle icon='el-icon-more' size='mini')
              el-dropdown-menu(slot='dropdown')
                el-dropdown-item(v-if='!resource.hidden' icon='el-icon-remove' @click.native='hideResource(resource, true)') {{$t('admin.hide_resource')}}
                el-dropdown-item(v-else icon='el-icon-success' @click.native='hideResource(resource, false)') {{$t('admin.show_resource')}}
                el-dropdown-item(icon='el-icon-delete' @click.native='deleteResource(resource)') {{$t('admin.delete_resource')}}
                el-dropdown-item(icon='el-icon-lock' @click.native='blockUser(resource)') {{$t('admin.block_user')}}
            a(:href='resource.data.url || resource.data.context')
              small {{resource.data.published|dateFormat('ddd, D MMMM HH:mm')}}

          div.mt-1(v-html='resource_filter(resource.data.content)')
          span.previewImage(@click='showResource(resource)')
            img(v-for='img in resource.data.attachment' :src='img.url')

</template>
<script>
import { mapState, mapGetters } from 'vuex'
import EventAdmin from './eventAdmin'
import EmbedEvent from './embedEvent'
import FollowMe from '../../components/FollowMe'
import { Message, MessageBox } from 'element-ui'

import moment from 'moment-timezone'

export default {
  name: 'Event',
  transition: null,
  components: { EventAdmin, EmbedEvent, FollowMe },
  async asyncData ({ $axios, params, error, store }) {
    try {
      const event = await $axios.$get(`/event/${params.id}`)
      return { event, id: Number(params.id) }
    } catch (e) {
      error({ statusCode: 404, message: 'Event not found' })
    }
  },
  data () {
    return {
      showEmbed: false,
      showFollowMe: false,
      showResources: false,
      selectedResource: { data: { attachment: [] } }
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
      href: this.settings.baseurl + `/feed/rss?places=${this.event.place.id}`
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
    showResource (resource) {
      this.showResources = true
      this.selectedResource = resource
      document.getElementById('resourceDialog').focus()
    },
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
      try {
        await MessageBox.confirm(this.$t('admin.user_block_confirm'), {
          confirmButtonText: this.$t('common.ok'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'error'
        })
        await this.$axios.post('/instances/toggle_user_block', { ap_id: resource.ap_user.ap_id })
        Message({ message: this.$t('admin.user_blocked', { user: resource.ap_user.ap_id }), type: 'success', showClose: true })
      } catch (e) { }
    },
    async deleteResource (resource) {
      try {
        await MessageBox.confirm(this.$t('admin.delete_resource_confirm'),
          this.$t('common.confirm'), {
            confirmButtonText: this.$t('common.ok'),
            cancelButtonText: this.$t('common.cancel'),
            type: 'error'
          })
        await this.$axios.delete(`/resources/${resource.id}`)
        this.event.resources = this.event.resources.filter(r => r.id !== resource.id)
      } catch (e) { }
    },
    copyLink () {
      Message({ message: this.$t('common.copied'), type: 'success', showClose: true })
    },
    // TOFIX
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
  time {
    margin: 0rem 0rem 0rem 1rem;
    display: inline-block;
  }

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
      .el-dialog__body {
        word-break: normal !important;
      }
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
    background-color: transparent;
  }

  div.menu {
    border-left: 1px solid #e6e6e6;
    p {
      margin: 1rem 0rem 1rem 1rem;
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
    .previewImage {
      display: flex;
      flex-flow: wrap;
      justify-content: space-evenly;
      img {
        margin-left: 5px;
        margin-top: 5px;
        object-fit: cover;
        min-height: 100px;
        max-width: 45%;
        border-radius: 5px;
        border: 1px solid #ccc;
      }
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
      border: 0px !important;
    }

    .title {
      font-size: 1em;
      font-weight: bold;
    }
  }
}
</style>
