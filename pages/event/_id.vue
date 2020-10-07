<template lang="pug">
  v-card.h-event.eventDetail
    v-container
      v-list-item(two-line)
        v-list-item-content
          v-list-item-title
            time.dt-start(:datetime='event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")')
            v-icon mdi-date
            b {{event|when}}
            small  ({{event.start_datetime|from}})
          v-list-item-title
            b.p-location {{event.place.name}}
            span  - {{event.place.address}}
          h2 {{event.title}}

      .v-btn--absolute.v-btn--right.v-btn--top
        v-btn.mr-1(nuxt icon outlined color='primary'
          :to='`/event/${event.prev}`' :disabled='!event.prev')
          v-icon mdi-arrow-left
        v-btn(nuxt bottom right outlined icon color='primary'
          :to='`/event/${event.next}`' :disabled='!event.next')
          v-icon mdi-arrow-right

    v-container
        v-dialog(v-model='showEmbed')
          EmbedEvent(:event='event')

        //- TOFIX: avoid reflow
        //- event image
        v-img.main_image.mb-3(
          contain
          :src='imgPath'
          :lazy-src='thumbImgPath'
          v-if='event.image_path')
          //- template(v-slot:placeholder)
            //- v-row(
            //-   class="fill-height ma-0"
            //-   align="center"
            //-   justify="center")
            //-   v-progress-circular(indeterminate
            //-     color="grey lighten-5")

        div.p-description(v-html='event.description')
        v-chip.p-category.ml-1(small v-for='tag in event.tags' color='primary' outlined :key='tag') {{tag}}

          //- info & actions
        v-btn(text color='primary'
          v-clipboard:success='copyLink'
          v-clipboard:copy='`${settings.baseurl}/event/${event.id}`') {{$t('common.copy_link')}}

        v-btn(@click='showEmbed=true' text color='primary') {{$t('common.embed')}}

        v-btn(:href='`${settings.baseurl}/api/event/${event.id}.ics`' text color='primary') {{$t('common.add_to_calendar')}}
        EventAdmin(v-if='is_mine' :event='event')

        //- hr

        //- resources from fediverse
        #resources.mt-1(v-if='settings.enable_federation')
          div.float-right(v-if='!settings.hide_boosts')
            small.mr-3 🔖 {{event.likes.length}}
            small ✊ {{event.boost.length}}<br/>

          p.p-2
            v-btn(type='text' @click='showFollowMe=true') {{$t('event.interact_with_me')}}
            span(v-if='settings.enable_resources && event.resources.length')  -  {{$tc('common.n_resources', event.resources.length)}}

          v-dialog(v-model='showFollowMe' destroy-on-close max-width='500px')
            h4(slot='title') {{$t('common.follow_me_title')}}
            FollowMe(@close='showFollowMe=false' is-dialog)

          v-dialog.showResource#resourceDialog(v-model='showResources' fullscreen
            width='95vw'
            destroy-on-close
            @keydown.native.right='$refs.carousel.next()'
            @keydown.native.left='$refs.carousel.prev()')
            v-carousel(:interval='10000' ref='carousel' arrow='always')
              v-carousel-item(v-for='attachment in selectedResource.data.attachment' :key='attachment.url')
                v-img(:src='attachment.url')
          v-list.mb-1(v-if='settings.enable_resources' v-for='resource in event.resources' dark
            :key='resource.id' :class='{disabled: resource.hidden}')
            v-list-item
              v-list-title
                v-menu(v-if='$auth.user && $auth.user.is_admin' offset-y)
                  template(v-slot:activator="{ on, attrs }")
                    v-btn.mr-2(v-on='on' v-attrs='attrs' color='primary' small icon outlined)
                      v-icon mdi-dots-vertical
                  v-list
                    v-list-item(v-if='!resource.hidden' @click='hideResource(resource, true)')
                      v-list-item-title <v-icon left>mdi-eye-off</v-icon> {{$t('admin.hide_resource')}}
                    v-list-item(v-else @click='hideResource(resource, false)')
                      v-list-item-title <v-icon left>mdi-eye-on</v-icon> {{$t('admin.show_resource')}}
                    v-list-item(@click='deleteResource(resource)')
                      v-list-item-title <v-icon left>mdi-delete</v-icon> {{$t('admin.delete_resource')}}
                    v-list-item(@click='blockUser(resource)')
                      v-list-item-title <v-icon left>mdi-lock</v-icon> {{$t('admin.block_user')}}

                a(:href='resource.data.url || resource.data.context')
                  small {{resource.data.published|dateFormat('ddd, D MMMM HH:mm')}}

                div.mt-1(v-html='resource_filter(resource.data.content)')
                span.previewImage(@click='showResource(resource)')
                  img(v-for='img in resource.data.attachment' :src='img.url')

</template>
<script>
import { mapState } from 'vuex'
import EventAdmin from './eventAdmin'
import EmbedEvent from './embedEvent'
import FollowMe from '../../components/FollowMe'
import moment from 'moment-timezone'
const htmlToText = require('html-to-text')

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
          content: this.plainDescription
        },
        {
          hid: 'og-description',
          name: 'og:description',
          content: this.plainDescription
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
          content: this.plainDescription
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
    ...mapState(['settings']),
    plainDescription () {
      return htmlToText.fromString(this.event.description.replace('\n', '').slice(0, 1000))
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
    async hideResource (resource, hidden) {
      await this.$axios.$put(`/resources/${resource.id}`, { hidden })
      resource.hidden = hidden
    },
    async blockUser (resource) {
      try {
        const ret = await this.$root.$confirm('admin.user_block_confirm', { user: resource.ap_user.ap_id })
        if (!ret) { return }
        await this.$axios.post('/instances/toggle_user_block', { ap_id: resource.ap_user.ap_id })
        this.$root.$message('admin.user_blocked', { user: resource.ap_user.ap_id, color: 'success' })
      } catch (e) { }
    },
    async deleteResource (resource) {
      try {
        const ret = await this.$root.$confirm('admin.delete_resource_confirm')
        if (!ret) { return }
        await this.$axios.delete(`/resources/${resource.id}`)
        this.event.resources = this.event.resources.filter(r => r.id !== resource.id)
      } catch (e) { }
    },
    copyLink () {
      this.$root.$message('common.copied', { color: 'success' })
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
.eventDetail {
  .main_image {
    width: 100%;
    margin: 0 auto;
    max-height: 83vh;
  }
}
</style>
