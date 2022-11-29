<template lang="pug">
v-card.h-event.event.d-flex(itemscope itemtype="https://schema.org/Event")
  nuxt-link(:to='`/event/${event.slug || event.id}`' itemprop="url")
    MyPicture(v-if='!hide_thumbs' :event='event' thumb :lazy='lazy')
    v-icon.float-right.mr-1(v-if='event.parentId' color='success' v-text='mdiRepeat')
    .title.p-name(itemprop="name") {{ event.title }}

  v-card-text.body.pt-0.pb-0
    time.dt-start.subtitle-1(:datetime='event.start_datetime | unixFormat("YYYY-MM-DD HH:mm")' itemprop="startDate" :content="event.start_datetime | unixFormat('YYYY-MM-DDTHH:mm')")  <v-icon v-text='mdiCalendar'></v-icon> {{ event | when }}
    .d-none.dt-end(v-if='event.end_datetime' itemprop="endDate" :content="event.end_datetime | unixFormat('YYYY-MM-DDTHH:mm')") {{ event.end_datetime | unixFormat('YYYY-MM-DD HH:mm') }}
    nuxt-link.place.d-block.p-location.pl-0(text :to='`/place/${encodeURIComponent(event.place.name)}`' itemprop="location" itemscope itemtype="https://schema.org/Place") <v-icon v-text='mdiMapMarker'></v-icon> <span itemprop='name'>{{ event.place.name }}</span>
      .d-none(itemprop='address') {{ event.place.address }}

  v-card-actions.flex-wrap
    v-chip.ml-1.mt-1(v-for='tag in event.tags.slice(0, 6)' small label :to='`/tag/${encodeURIComponent(tag)}`'
      :key='tag' outlined color='primary') {{ tag }}

</template>
<script>
import { mapState } from 'vuex'
import MyPicture from '~/components/MyPicture'
import { mdiRepeat, mdiCalendar, mdiMapMarker } from '@mdi/js'

export default {
  data({ $store }) {
    return { mdiRepeat, mdiMapMarker, mdiCalendar,
      hide_thumbs: this.$cookies.get('theme.hide_thumbs') || $store.state.settings.hide_thumbs
    }
  },
  components: {
    MyPicture
  },
  props: {
    event: { type: Object, default: () => ({}) },
    lazy: Boolean
  },
  computed: mapState(['settings'])
}
</script>
