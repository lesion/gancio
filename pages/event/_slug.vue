<template lang="pug">
#event.h-event.pa-2.pa-sm-2.pt-0.pt-sm-0.container(v-touch="{ left: goNext, right: goPrev }" itemscope itemtype="https://schema.org/Event")
    //- EVENT PAGE
    //- gancio supports microformats (http://microformats.org/wiki/h-event)
    //- and microdata https://schema.org/Event
    h1.title.text-center.text-md-h4.text-h5.pa-6
      strong.p-name.text--primary(itemprop="name") {{event.title}}
    v-row
      v-col.col-12.col-md-8.pr-sm-2.pr-md-0
        MyPicture(v-if='hasMedia' :event='event')
        .p-description.text-body-1.pa-3.rounded(v-if='event.description' itemprop='description' v-html='event.description')

      v-col.col-12.col-md-4
        v-card(outlined)
          v-container.eventDetails
            v-icon.float-right(v-if='event.parentId' color='success' v-text='mdiRepeat')
            v-icon.float-right.mr-1(v-if='isPast' color='warning' v-text='mdiTimerSandComplete')
            time.dt-start(:datetime='$time.unixFormat(event.start_datetime, "yyyy-MM-dd HH:mm")' itemprop="startDate" :content='$time.unixFormat(event.start_datetime, "yyyy-MM-dd\'T\'HH:mm")')
              v-icon(v-text='mdiCalendar' small)
              span.ml-2.text-uppercase {{$time.when(event)}}
              .d-none.dt-end(v-if='event.end_datetime' itemprop="endDate" :content='$time.unixFormat(event.end_datetime,"yyyy-MM-dd\'T\'HH:mm")') {{$time.unixFormat(event.end_datetime,"yyyy-MM-dd'T'HH:mm")}}
            div.font-weight-light.mb-3 {{$time.from(event.start_datetime)}}
              small(v-if='event.parentId')  ({{$time.recurrentDetail(event)}})

            .p-location.h-adr(itemprop="location" itemscope itemtype="https://schema.org/Place")
              v-icon(v-text='mdiMapMarker' small)
              nuxt-link.vcard.ml-2.p-name.text-decoration-none.text-uppercase(:to='`/place/${event?.place?.id}/${encodeURIComponent(event?.place?.name)}`') 
                span(itemprop='name') {{event?.place?.name}}
              .font-weight-light.p-street-address(v-if='event?.place?.name !=="online"' itemprop='address') {{event?.place?.address}}

            //- a.d-block(v-if='event.ap_object?.url' :href="event.ap_object?.url") {{ event.ap_object?.url }}
            a(v-if='event?.original_url'  :href="event?.original_url") {{event.original_url}}

          //- tags, hashtags
          v-container.pt-0(v-if='event?.tags?.length')
            v-chip.p-category.ml-1.mt-1(v-for='tag in event.tags' small label color='primary'
              outlined :key='tag' :to='`/tag/${encodeURIComponent(tag)}`') {{tag}}

          //- online events
          v-list(nav dense v-if='hasOnlineLocations')
            v-list-item(v-for='(item, index) in event.online_locations' target='_blank' :href="`${item}`" :key="index")
              v-list-item-icon
                v-icon(v-text='mdiMonitorAccount')
              v-list-item-content.py-0
                v-list-item-title.text-caption(v-text='item')

          v-divider
          //- info & actions
          v-list(dense nav color='transparent')

              //- copy link
              v-list-item(@click='clipboard(`${settings.baseurl}/event/${event.slug || event.id}`)')
                v-list-item-icon
                  v-icon(v-text='mdiContentCopy')
                v-list-item-content
                  v-list-item-title(v-text="$t('common.copy_link')")

              //- map
              v-list-item(v-if='settings.allow_geolocation && event.place?.latitude && event.place?.longitude' @click="mapModal = true")
                v-list-item-icon
                  v-icon(v-text='mdiMap')
                v-list-item-content
                  v-list-item-title(v-text="$t('common.show_map')")

              //- calendar
              v-list-item(:href='`/api/event/detail/${event.slug || event.id}.ics`')
                v-list-item-icon
                  v-icon(v-text='mdiCalendarExport')
                v-list-item-content
                  v-list-item-title(v-text="$t('common.add_to_calendar')")

              //- Report
              v-list-item(v-if='settings.enable_moderation && settings.enable_report && !showModeration' @click='report')
                v-list-item-icon
                  v-icon(v-text='mdiMessageTextOutline')
                v-list-item-content
                  v-list-item-title(v-text="$t('common.report')")

              //- download flyer
              v-list-item(v-if='hasMedia && settings.show_download_media' :href='$helper.mediaURL(event, "download")')
                v-list-item-icon
                  v-icon(v-text='mdiFileDownloadOutline')
                v-list-item-content
                  v-list-item-title(v-text="$t('event.download_flyer')")

              //- embed
              v-list-item(@click='showEmbed=true')
                v-list-item-icon
                  v-icon(v-text='mdiCodeTags')
                v-list-item-content
                  v-list-item-title(v-text="$t('common.embed')")



          //- admin actions
          template(v-if='can_edit')
            EventAdmin(:event='event' @openModeration='openModeration=true' @openAssignAuthor='openAssignAuthor=true')

    //- resources from fediverse
    EventResource#resources.mt-3(:event='event' v-if='showResources')

    //- Next/prev arrow
    .text-center.mt-5.mb-5
      v-btn.mr-2(nuxt icon outlined color='primary'
        :to='`/event/${event.prev ? event.prev : (event.slug || event.id)}`' :disabled='!event.prev')
        v-icon(v-text='mdiArrowLeft')
      v-btn(nuxt bottom right outlined icon color='primary'
        :to='`/event/${event.next ? event.next : (event.slug || event.id)}`' :disabled='!event.next')
        v-icon(v-text='mdiArrowRight')

    v-dialog(v-model='showEmbed' width='700px' :fullscreen='$vuetify.breakpoint.xsOnly')
      EmbedEvent(:event='event' @close='showEmbed=false')

    v-dialog(v-show='settings.allow_geolocation && event.place?.latitude && event.place?.longitude' v-model='mapModal' :fullscreen='$vuetify.breakpoint.xsOnly' destroy-on-close)
      EventMapDialog(:place='event.place' @close='mapModal=false')

    v-dialog(v-if='$auth?.user?.is_admin' v-model='openAssignAuthor' :fullscreen='$vuetify.breakpoint.xsOnly' destroy-on-close width=400)
      EventAssignAuthor(:event='event' @close='openAssignAuthor=false')

    v-navigation-drawer(v-model='openModeration' :fullscreen='$vuetify.breakpoint.xsOnly' fixed top right width=400 temporary)
      EventModeration(:event='event' v-if='openModeration' @close='openModeration=false')

</template>
<script>
import { mapState } from 'vuex'
import { DateTime } from 'luxon'
import clipboard from '../../assets/clipboard'
import MyPicture from '~/components/MyPicture'
import EventAdmin from '@/components/EventAdmin'
import EventResource from '@/components/EventResource'
import EmbedEvent from '@/components/embedEvent'
import EventMapDialog from '@/components/EventMapDialog'
import EventModeration from '@/components/EventModeration'

import { mdiArrowLeft, mdiArrowRight, mdiDotsVertical, mdiCodeTags, mdiClose, mdiMap, mdiMessageTextOutline,
  mdiEye, mdiEyeOff, mdiDelete, mdiRepeat, mdiLock, mdiFileDownloadOutline, mdiShareAll, mdiTimerSandComplete,
  mdiCalendarExport, mdiCalendar, mdiContentCopy, mdiMapMarker, mdiChevronUp, mdiMonitorAccount, mdiBookmark, mdiStar } from '@mdi/js'

export default {
  name: 'Event',
  mixins: [clipboard],
  components: {
    EventAdmin,
    EventResource,
    EventModeration,
    EventAssignAuthor: () => import(/* webpackChunkName: "admin" */ '@/components/EventAssignAuthor'),
    EmbedEvent,
    MyPicture,
    EventMapDialog
  },
  async asyncData ({ $axios, params, error }) {
    try {
      const event = await $axios.$get(`/event/detail/${params.slug}`)
      return { event }
    } catch (e) {
      error({ statusCode: 404, message: 'Event not found' })
    }
  },
  data ({$route}) {
    return {
      mdiArrowLeft, mdiArrowRight, mdiDotsVertical, mdiCodeTags, mdiCalendarExport, mdiCalendar, mdiFileDownloadOutline, mdiMessageTextOutline, mdiTimerSandComplete,
      mdiMapMarker, mdiContentCopy, mdiClose, mdiDelete, mdiEye, mdiEyeOff, mdiRepeat, mdiMap, mdiChevronUp, mdiMonitorAccount, mdiBookmark, mdiStar, mdiShareAll,
      currentAttachment: 0,
      event: {},
      showEmbed: false,
      mapModal: false,
      openModeration: $route?.query?.moderation ? true : false,
      openAssignAuthor: false,
      reporting: false
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
      title: `${this.settings.title} events  @${this.event?.place?.name}`,
      href: this.settings.baseurl + `/feed/rss?places=${this.event?.place?.id}`
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
    hasOnlineLocations () {
      return this.event.online_locations && this.event.online_locations.length
    },
    showModeration () {
      return this.settings.enable_moderation && this.$auth?.user && (this.event.isMine || this.$auth?.user?.is_admin || this.$auth?.user?.is_editor)
    },
    showMap () {
      return this.settings.allow_geolocation && this.event.place?.latitude && this.event.place?.longitude
    },
    hasMedia () {
      return this.event.media && this.event.media.length
    },
    plainDescription () {
      return this.event.plain_description || ''
    },
    can_edit () {
      if (!this.$auth.user) {
        return false
      }
      return (
        this.event.isMine || this.$auth.user.is_admin || this.$auth.user.is_editor
      )
    },
    showResources () {
      return this.settings.enable_federation &&
      ( (!this.settings.hide_boosts && (this.event.boost?.length || this.event?.likes?.length)) ||
      ( this.settings.enable_resources && this.event?.resources?.length))      
    },
    isPast() {
      const now = new Date()
      if (this.event.end_datetime) {
        return new Date(this.event.end_datetime*1000) < now
      } else {
        return new Date((3*60*60+this.event.start_datetime)*1000) < now
      }
    }
  },
  mounted () {
    window.addEventListener('keydown', this.keyDown)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.keyDown)
  },
  methods: {
    async report () {
      this.reporting = true
      const message = await this.$root.$prompt(this.$t('event.report_message_confirmation'), { title: this.$t('common.report') })
      if (!message) {
        return
      }
      this.reporting = false
      try {
        await this.$axios.$post(`/event/messages/${this.event.id}`, { message })
        this.$root.$message('common.sent', { color: 'success' })
      } catch (e) {
        this.$root.$message(e, { color: 'warning' })
      }
    },
    keyDown (ev) {
      if (this.openModeration || this.reporting) {
        return
      }
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
    copyLink () {
      this.$root.$message('common.copied', { color: 'success' })
    },
  }
}
</script>


