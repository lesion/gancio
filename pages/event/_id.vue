<template lang="pug">
v-container#event
  //- EVENT PAGE
  //- gancio supports microformats (http://microformats.org/wiki/h-event)
  v-card.h-event
    v-card-actions
      //- admin controls
      EventAdmin.mb-1(v-if='is_mine' :event='event')
    v-card-text

      v-row
        v-col.col-12.col-lg-8
          v-img.main_image.mb-3(
            contain
            :src='imgPath'
            :lazy-src='thumbImgPath'
            v-if='event.image_path')
          .p-description.text-body-1.pa-3.grey.darken-4.rounded(v-else v-html='event.description')

            //- template(v-slot:placeholder)
              //- v-row(
              //-   class="fill-height ma-0"
              //-   align="center"
              //-   justify="center")
              //-   v-progress-circular(indeterminate
              //-     color="grey lighten-5")

        v-col.col-12.col-lg-4
          v-card
            v-card-text
              v-icon.float-right(v-if='event.parentId' color='success') mdi-repeat
              .title.text-h5
                b.p-name {{event.title}}

              time.dt-start.text-h6(:datetime='event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")')
                v-icon mdi-calendar
                b.ml-2 {{event|when}}
              div.text-subtitle-1 {{event.start_datetime|from}}
                small(v-if='event.parentId')  ({{event|recurrentDetail}})

              .text-h6.p-location
                v-icon mdi-map-marker
                b.vcard.ml-2 {{event.place.name}}
              .text-subtitle-1.adr {{event.place.address}}

            //- tags, hashtags
            v-card-text(v-if='event.tags.length')
              v-chip.p-category.ml-1.mt-3(v-for='tag in event.tags' color='primary'
                outlined :key='tag' v-text='tag')

            //- info & actions
            v-toolbar
              v-tooltip(bottom) {{$t('common.copy_link')}}
                template(v-slot:activator="{on, attrs} ")
                  v-btn.ml-2(large icon v-on='on' color='primary'
                    v-clipboard:success='copyLink'
                    v-clipboard:copy='`${settings.baseurl}/event/${event.slug || event.id}`')
                    v-icon mdi-content-copy
              v-tooltip(bottom) {{$t('common.embed')}}
                template(v-slot:activator="{on, attrs} ")
                  v-btn.ml-2(large icon v-on='on' @click='showEmbed=true' color='primary')
                    v-icon mdi-code-tags
              v-tooltip(bottom) {{$t('common.add_to_calendar')}}
                template(v-slot:activator="{on, attrs} ")
                  v-btn.ml-2(large icon v-on='on' color='primary'
                    :href='`/api/event/${event.slug || event.id}.ics`')
                    v-icon mdi-calendar-export

      .p-description.text-body-1.pa-3.grey.darken-4.rounded(v-if='event.image_path && event.description' v-html='event.description')

      //- resources from fediverse
      #resources.mt-1(v-if='settings.enable_federation')
        div.float-right(v-if='!settings.hide_boosts')
          small.mr-3 🔖 {{event.likes.length}}
          small ✊ {{event.boost.length}}<br/>

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

      //- Next/prev arrow
      .text-center.mt-5.mb-5
        v-btn.mr-2(nuxt icon outlined color='primary'
          :to='`/event/${event.prev}`' :disabled='!event.prev')
          v-icon mdi-arrow-left
        v-btn(nuxt bottom right outlined icon color='primary'
          :to='`/event/${event.next}`' :disabled='!event.next')
          v-icon mdi-arrow-right

      v-dialog(v-model='showEmbed' width='1000px')
        EmbedEvent(:event='event' @close='showEmbed=false')

</template>
<script>
import { mapState } from 'vuex'
import EventAdmin from './eventAdmin'
import EmbedEvent from './embedEvent'
import moment from 'dayjs'
const htmlToText = require('html-to-text')

export default {
  name: 'Event',
  components: { EventAdmin, EmbedEvent },
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
      event: {},
      showEmbed: false,
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
          content: `${this.settings.baseurl}/event/${this.event.slug || this.event.id}`
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
      return this.settings.baseurl + '/media/thumb/' + this.event.image_path
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
  mounted () {
    window.addEventListener('keydown', this.keyDown)
  },
  destroyed () {
    window.removeEventListener('keydown', this.keyDown)
  },
  methods: {
    keyDown (ev) {
      if (ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey) { return }
      if (ev.key === 'ArrowRight' && this.event.next) {
        this.$router.replace(`/event/${this.event.next}`)
      }
      if (ev.key === 'ArrowLeft' && this.event.prev) {
        this.$router.replace(`/event/${this.event.prev}`)
      }
    },
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
.title {
  margin-bottom: 25px;
  color: yellow;
  font-weight: 300 !important;
}
.main_image {
  // width: 100%;
  margin: 0 auto;
  // max-height: 120vh;
  border-radius: 5px;
  transition: max-height 0.2s;
}
</style>
