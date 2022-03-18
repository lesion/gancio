<template lang="pug">
v-container#event.pa-0.pa-sm-2
  //- EVENT PAGE
  //- gancio supports microformats (http://microformats.org/wiki/h-event)
  v-card.h-event(itemscope itemtype="https://schema.org/Event")
    v-card-actions
      //- admin controls
      EventAdmin.mb-1(v-if='is_mine' :event='event')
    v-card-text

      v-row
        v-col.col-12.col-lg-8
          //- fake image to use u-featured in h-event microformat
          img.u-featured(v-show='false' v-if='hasMedia' :src='event | mediaURL' itemprop="image")
          v-img.main_image.mb-3(
            contain
            :alt='event | mediaURL("alt")'
            :src='event | mediaURL'
            :lazy-src='event | mediaURL("thumb")'
            v-if='hasMedia')
          .p-description.text-body-1.pa-3.rounded(v-if='!hasMedia && event.description' itemprop='description' v-html='event.description')

        v-col.col-12.col-lg-4
          v-card(outlined)
            v-card-text
              v-icon.float-right(v-if='event.parentId' color='success' v-text='mdiRepeat')
              .title.text-h5
                b.p-name(itemprop="name") {{event.title}}

              time.dt-start.text-h6(:datetime='event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")' itemprop="startDate" :content="event.start_datetime|unixFormat('YYYY-MM-DDTHH:mm')")
                v-icon(v-text='mdiCalendar')
                b.ml-2 {{event|when}}
                .d-none.dt-end(itemprop="endDate" :content="event.end_datetime|unixFormat('YYYY-MM-DDTHH:mm')") {{event.end_datetime|unixFormat('YYYY-MM-DD HH:mm')}}
              div.text-subtitle-1 {{event.start_datetime|from}}
                small(v-if='event.parentId')  ({{event|recurrentDetail}})

              .text-h6.p-location.h-adr(itemprop="location" itemscope itemtype="https://schema.org/Place")
                v-icon(v-text='mdiMapMarker')
                b.vcard.ml-2.p-name(itemprop="name") {{event.place && event.place.name}}
                .text-subtitle-1.p-street-address(itemprop='address') {{event.place && event.place.address}}

            //- tags, hashtags
            v-card-text(v-if='event.tags.length')
              v-chip.p-category.ml-1.mt-3(v-for='tag in event.tags' color='primary'
                outlined :key='tag')
                span(v-text='tag')

            //- info & actions
            v-toolbar
              v-btn.ml-2(large icon :title="$t('common.copy_link')" :aria-label="$t('common.copy_link')" color='primary'
                @click='clipboard(`${settings.baseurl}/event/${event.slug || event.id}`)')
                v-icon(v-text='mdiContentCopy')
              v-btn.ml-2(large icon :title="$t('common.embed')" :aria-label="$t('common.embed')" @click='showEmbed=true' color='primary')
                v-icon(v-text='mdiCodeTags')
              v-btn.ml-2(large icon :title="$t('common.add_to_calendar')" color='primary' :aria-label="$t('common.add_to_calendar')"
                :href='`/api/event/${event.slug || event.id}.ics`')
                v-icon(v-text='mdiCalendarExport')

      .p-description.text-body-1.pa-3.rounded(v-if='hasMedia && event.description' itemprop='description' v-html='event.description')

      //- resources from fediverse
      #resources.mt-1(v-if='settings.enable_federation')
        //- div.float-right(v-if='settings.hide_boosts')
        //-   small.mr-3 🔖 {{event.likes.length}}
        //-   small ✊ {{event.boost.length}}<br/>

        v-dialog(v-model='showResources' max-width="900" width="900" :fullscreen='$vuetify.breakpoint.xsOnly'
          destroy-on-close)
          v-card
            v-btn.ma-2(icon dark @click='showResources = false')
              v-icon(v-text='mdiClose')
            v-carousel.pa-5(:interval='10000'
              :next-icon='mdiArrowRight'
              :prev-icon='mdiArrowLeft'
              ref='carousel' hide-delimiters v-model='currentAttachment'
              height='100%' show-arrows-on-over)
              v-carousel-item(v-for='attachment in selectedResource.data.attachment'
                v-if='isImg(attachment)'
                :key='attachment.url')
                v-img(:src='attachment.url' contain max-height='90%')
            v-card-actions.align-center.justify-center
              span {{currentAttachmentLabel}}

        v-card.mb-3.resources(v-if='settings.enable_resources' v-for='resource in event.resources'
          :key='resource.id' elevation='10' :flat='resource.hidden' outlined)
            v-card-title
              v-menu(v-if='$auth.user && $auth.user.is_admin' offset-y)
                template(v-slot:activator="{ on }")
                  v-btn.mr-2(v-on='on' color='primary' small icon)
                    v-icon(v-text='mdiDotsVertical')
                v-list
                  v-list-item(v-if='!resource.hidden' @click='hideResource(resource, true)')
                    v-list-item-title <v-icon left v-text='mdiEyeOff'></v-icon> {{$t('admin.hide_resource')}}
                  v-list-item(v-else @click='hideResource(resource, false)')
                    v-list-item-title <v-icon left v-text='mdiEye'></v-icon> {{$t('admin.show_resource')}}
                  v-list-item(@click='deleteResource(resource)')
                    v-list-item-title <v-icon left v-text='mdiDelete'></v-icon> {{$t('admin.delete_resource')}}
                  v-list-item(@click='blockUser(resource)')
                    v-list-item-title <v-icon left v-text='mdiLock'></v-icon> {{$t('admin.block_user')}}

              v-icon.mr-1(v-show='resource.hidden' v-text='mdiEyeOff')

              a(:href='resource.data.url || resource.data.context')
                small {{resource.data.published|dateFormat('ddd, D MMMM HH:mm')}}

            v-card-text

              div.mt-1(v-html='resource_filter(resource.data.content)')
              div.d-flex.flex-wrap
                span.mr-1(v-for='attachment in resource.data.attachment' :key='attachment.url')
                  audio(v-if='isAudio(attachment)' controls)
                    source(:src='attachment.url')
                  v-img.cursorPointer(v-if='isImg(attachment)' :src='attachment.url' @click='showResource(resource)'
                    max-height="250px"
                    max-width="250px"
                    contain :alt='attachment.name')

      //- Next/prev arrow
      .text-center.mt-5.mb-5
        v-btn.mr-2(nuxt icon outlined color='primary'
          :to='`/event/${event.prev}`' :disabled='!event.prev')
          v-icon(v-text='mdiArrowLeft')
        v-btn(nuxt bottom right outlined icon color='primary'
          :to='`/event/${event.next}`' :disabled='!event.next')
          v-icon(v-text='mdiArrowRight')

      v-dialog(v-model='showEmbed' width='700px' :fullscreen='$vuetify.breakpoint.xsOnly')
        EmbedEvent(:event='event' @close='showEmbed=false')

</template>
<script>
import { mapState } from 'vuex'
import get from 'lodash/get'
import moment from 'dayjs'
import clipboard from '../../assets/clipboard'
const htmlToText = require('html-to-text')

import { mdiArrowLeft, mdiArrowRight, mdiDotsVertical, mdiCodeTags, mdiClose,
  mdiEye, mdiEyeOff, mdiDelete, mdiRepeat, mdiLock,
  mdiCalendarExport, mdiCalendar, mdiContentCopy, mdiMapMarker } from '@mdi/js'

export default {
  name: 'Event',
  mixins: [clipboard],
  components: {
    EventAdmin: () => import(/* webpackChunkName: "event" */'./eventAdmin'),
    EmbedEvent: () => import(/* webpackChunkName: "event" */'./embedEvent'),
  },
  async asyncData ({ $axios, params, error, store }) {
    try {
      const event = await $axios.$get(`/event/${params.slug}`)
      return { event }
    } catch (e) {
      error({ statusCode: 404, message: 'Event not found' })
    }
  },
  data () {
    return {
      mdiArrowLeft, mdiArrowRight, mdiDotsVertical, mdiCodeTags, mdiCalendarExport, mdiCalendar,
      mdiMapMarker, mdiContentCopy, mdiClose, mdiDelete, mdiEye, mdiEyeOff, mdiRepeat, mdiLock,
      currentAttachment: 0,
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
      title: `${this.settings.title} events  @${this.event.place && this.event.place.name}`,
      href: this.settings.baseurl + `/feed/rss?places=${this.event.place && this.event.place.id}`
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
          content: this.$options.filters.mediaURL(this.event)
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
          content: this.$options.filters.mediaURL(this.event, 'thumb')
        },
        {
          property: 'twitter:description',
          content: this.plainDescription
        }
      ],
      link: [
        { rel: 'image_src', href: this.$options.filters.mediaURL(this.event, 'thumb') },
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
    hasMedia () {
      return this.event.media && this.event.media.length
    },
    plainDescription () {
      return htmlToText.fromString(this.event.description.replace('\n', '').slice(0, 1000))
    },
    currentAttachmentLabel () {
      return get(this.selectedResource, `data.attachment[${this.currentAttachment}].name`, '')
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
    isImg (attachment) {
      const type = attachment.mediaType.split('/')[0]
      return type === 'image'
    },
    isAudio (attachment) {
      const type = attachment.mediaType.split('/')[0]
      return type === 'audio'
    },
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
      // document.getElementById('resourceDialog').focus()
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
<style scoped>
.main_image {
  margin: 0 auto;
  border-radius: 5px;
  transition: max-height 0.2s;
}
</style>
