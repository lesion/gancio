<template lang="pug">
v-container#event.pa-0.pa-sm-2(itemscope itemtype="https://schema.org/Event" v-touch="{ left: goNext, right: goPrev }")
    //- EVENT PAGE
    //- gancio supports microformats (http://microformats.org/wiki/h-event)
    //- and microdata https://schema.org/Event

    v-row
      v-col.col-12.col-md-8
        MyPicture(v-if='hasMedia' :event='event')
        .p-description.text-body-1.pa-3.rounded(v-if='!hasMedia && event.description' itemprop='description' v-html='event.description')

      v-col.col-12.col-md-4
        v-card(outlined)
          v-card-text
            v-icon.float-right(v-if='event.parentId' color='success' v-text='mdiRepeat')
            .title.text-h5
              strong.p-name.text--primary(itemprop="name") {{event.title}}
          v-divider
          v-container.eventDetails
            time.dt-start(:datetime='$time.unixFormat(event.start_datetime, "yyyy-MM-dd HH:mm")' itemprop="startDate" :content="$time.unixFormat(event.start_datetime, \"yyyy-MM-dd'T'HH:mm\")")
              v-icon(v-text='mdiCalendar' small)
              strong.ml-2.text-uppercase {{$time.when(event)}}
              .d-none.dt-end(v-if='event.end_datetime' itemprop="endDate" :content="$time.unixFormat(event.end_datetime,\"yyyy-MM-dd'T'HH:mm\")") {{$time.unixFormat(event.end_datetime,"yyyy-MM-dd'T'HH:mm")}}
            div.font-weight-light.mb-3 {{$time.from(event.start_datetime)}}
              small(v-if='event.parentId')  ({{$time.recurrentDetail(event)}})

            .p-location.h-adr(itemprop="location" itemscope itemtype="https://schema.org/Place")
              v-icon(v-text='mdiMapMarker' small)
              nuxt-link.vcard.ml-2.p-name.text-decoration-none.text-uppercase(itemprop="name" :to='`/place/${encodeURIComponent(event.place.name)}`') {{event.place && event.place.name}}
              .font-weight-light.p-street-address(itemprop='address') {{event.place && event.place.address}}

          //- tags, hashtags
          v-container.pt-0(v-if='event.tags && event.tags.length')
            v-chip.p-category.ml-1.mt-1(v-for='tag in event.tags' small label color='primary'
              outlined :key='tag' :to='`/tag/${encodeURIComponent(tag)}`') {{tag}}

          v-divider
          //- info & actions
          v-list(dense nav color='transparent')
              //- v-list-group(:append-icon='mdiChevronUp' :value='true')
              //-   template(v-slot:activator)
              //-     v-list-item.text-overline {{$t('common.actions')}}

              //- copy link
              v-list-item(@click='clipboard(`${settings.baseurl}/event/${event.slug || event.id}`)')
                v-list-item-icon
                  v-icon(v-text='mdiContentCopy')
                v-list-item-content
                  v-list-item-title(v-text="$t('common.copy_link')")

              //- map
              v-list-item(v-if='settings.allow_geolocation && event.place.latitude && event.place.longitude' @click="mapModal = true")
                v-list-item-icon
                  v-icon(v-text='mdiMap')
                v-list-item-content
                  v-list-item-title(v-text="$t('common.show_map')")

              //- embed
              v-list-item(@click='showEmbed=true')
                v-list-item-icon
                  v-icon(v-text='mdiCodeTags')
                v-list-item-content
                  v-list-item-title(v-text="$t('common.embed')")
              
              //- calendar
              v-list-item(:href='`/api/event/detail/${event.slug || event.id}.ics`')
                v-list-item-icon
                  v-icon(v-text='mdiCalendarExport')
                v-list-item-content
                  v-list-item-title(v-text="$t('common.add_to_calendar')")

              //- download flyer
              v-list-item(v-if='hasMedia' :href='$helper.mediaURL(event, "download")')
                v-list-item-icon
                  v-icon(v-text='mdiFileDownloadOutline')
                v-list-item-content
                  v-list-item-title(v-text="$t('event.download_flyer')")

          v-divider

          //- admin actions
          eventAdmin(v-if='is_mine' :event='event')


    .p-description.text-body-1.pa-3.rounded(v-if='hasMedia && event.description' itemprop='description' v-html='event.description')

    //- resources from fediverse
    #resources.mt-1(v-if='settings.enable_federation')
      div.mb-3(v-if='!settings.hide_boosts && (event.boost?.length || event.likes?.length) ')
        client-only
          v-menu(open-on-hover top offset-y)
            template( v-slot:activator="{ on, attrs }")
              span.mr-3(v-bind='attrs' v-on='on') <v-icon color='primary' v-text='mdiBookmark' /> {{event.likes.length}}
            v-list
              v-list-item(v-for='(like, idx) in event.likes' :key='idx')
                v-list-item-title(v-text='like')
          v-menu(open-on-hover top offset-y)
            template( v-slot:activator="{ on, attrs }")
              span(v-bind='attrs' v-on='on') <v-icon v-text='mdiShareAll' /> {{event.boost.length}}
            v-list
              v-list-item(v-for='(boost, idx) in event.boost' :key='idx')
                v-list-item-title(v-text='boost')
          template(slot='placeholder')
            span.mr-3 <v-icon color='primary' v-text='mdiBookmark' /> {{event.likes.length}}
            span <v-icon v-text='mdiShareAll' /> {{event.boost.length}}

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
              small {{$time.format(resource.data.published,'ff')}}

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
    
    v-dialog(v-show='settings.allow_geolocation && event.place.latitude && event.place.longitude' v-model='mapModal' :fullscreen='$vuetify.breakpoint.xsOnly' destroy-on-close)
      Map(:event='event' @close='mapModal=false')        

</template>
<script>
import { mapState } from 'vuex'
import get from 'lodash/get'
import { DateTime } from 'luxon'
import clipboard from '../../assets/clipboard'
import MyPicture from '~/components/MyPicture'
import EventAdmin from '@/components/eventAdmin'
import EmbedEvent from '@/components/embedEvent'

const { htmlToText } = require('html-to-text')

import { mdiArrowLeft, mdiArrowRight, mdiDotsVertical, mdiCodeTags, mdiClose, mdiMap,
  mdiEye, mdiEyeOff, mdiDelete, mdiRepeat, mdiLock, mdiFileDownloadOutline, mdiShareAll,
  mdiCalendarExport, mdiCalendar, mdiContentCopy, mdiMapMarker, mdiChevronUp, mdiBookmark } from '@mdi/js'

export default {
  name: 'Event',
  mixins: [clipboard],
  components: {
    EventAdmin,
    EmbedEvent,
    MyPicture,
    [process.client && 'Map']: () => import('@/components/Map.vue')
  },
  async asyncData ({ $axios, params, error }) {
    try {
      const event = await $axios.$get(`/event/detail/${params.slug}`)
      return { event }
    } catch (e) {
      error({ statusCode: 404, message: 'Event not found' })
    }
  },
  data () {
    return {
      mdiArrowLeft, mdiArrowRight, mdiDotsVertical, mdiCodeTags, mdiCalendarExport, mdiCalendar, mdiFileDownloadOutline,
      mdiMapMarker, mdiContentCopy, mdiClose, mdiDelete, mdiEye, mdiEyeOff, mdiRepeat, mdiLock, mdiMap, mdiChevronUp, mdiBookmark, mdiShareAll,
      currentAttachment: 0,
      event: {},
      diocane: '',
      showEmbed: false,
      showResources: false,
      selectedResource: { data: { attachment: [] } },
      mapModal: false
    }
  },
  head () {
    if (!this.event) {
      return {}
    }
    const tags_feed = this.event.tags && this.event.tags.map(tag => ({
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
          content: this.$helper.mediaURL(this.event)
        },
        { property: 'og:site_name', content: this.settings.title },
        {
          property: 'og:updated_time',
          content: DateTime.fromSeconds(this.event.start_datetime, { zone: this.settings.instance_timezone }).toISO()
        },
        {
          property: 'article:published_time',
          content: DateTime.fromSeconds(this.event.start_datetime, { zone: this.settings.instance_timezone }).toISO()
        },
        { property: 'article:section', content: 'event' },
        { property: 'twitter:card', content: 'summary' },
        { property: 'twitter:title', content: this.event.title },
        {
          property: 'twitter:image',
          content: this.$helper.mediaURL(this.event)
        },
        {
          property: 'twitter:description',
          content: this.plainDescription
        }
      ],
      link: [
        { rel: 'image_src', href: this.$helper.mediaURL(this.event) },
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
      return htmlToText(this.event.description && this.event.description.replace('\n', '').slice(0, 1000))
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
  beforeDestroy () {
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
        this.goNext()
      }
      if (ev.key === 'ArrowLeft' && this.event.prev) {
        this.goPrev()
      }
    },
    goPrev () {
      if (this.event.prev) {
        this.$router.replace(`/event/${this.event.prev}`)
      }
    },
    goNext () {
      if (this.event.next) {
        this.$router.replace(`/event/${this.event.next}`)
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


