<template>
<article class='h-event' itemscope itemtype="https://schema.org/Event">


  <nuxt-link :to='`/event/${event.slug || event.id}`' itemprop="url">
    <MyPicture v-if='!hide_thumbs' :event='event' thumb :lazy='lazy' />
    <v-icon class='float-right mr-1' v-if='event.parentId' color='success' v-text='mdiRepeat' />
    <h1 class='title p-name' itemprop="name">{{ event.title }}</h1>
  </nuxt-link>

  <v-img contain v-if='event?.ap_user?.image' :src='event?.ap_user?.image' max-height=30  max-width=30 style="position: absolute; top: 5px; right: 5px;" />

  <div v-if="isPast" style="
  position: absolute;
  background: #6b6b6b;
  box-shadow: 0 0 0 999px #6b6b6b;
  clip-path: inset(0 -100%);
  inset: 0 0 auto auto;
  transform-origin: 0 0;
  transform: translate(29.3%) rotate(45deg);
">Past event</div>

  <v-card-text class='body pt-0 pb-0'>

    <time class='dt-start subtitle-1' :datetime='$time.unixFormat(event.start_datetime, "yyyy-MM-dd HH:mm")'
      itemprop="startDate" :content="$time.unixFormat(event.start_datetime, 'yyyy-MM-dd\'T\'HH:mm')"> <v-icon v-text='mdiCalendar' /> {{ $time.when(event) }}
    </time>
    <time class='d-none dt-end' v-if='event.end_datetime' itemprop="endDate"
      :content="$time.unixFormat(event.end_datetime,'yyyy-MM-dd\'T\'HH:mm')"> {{ $time.unixFormat(event.end_datetime)}}</time>

    <nuxt-link class='place d-block p-location pl-0' text
      :to='`/place/${encodeURIComponent(event.place.name)}`'
      itemprop="location" itemscope itemtype="https://schema.org/Place">
      <v-icon v-text='mdiMapMarker'></v-icon>
      <span itemprop='name'>{{ event.place.name }}</span>
    </nuxt-link>
    <div class='d-none' itemprop='address'>{{ event.place.address }}</div>
  </v-card-text>

  <v-card-actions class='flex-wrap'>
    <v-chip class='ml-1 mt-1' v-for='tag in event.tags.slice(0, 6)' small label :to='`/tag/${encodeURIComponent(tag)}`' :key='tag' outlined color='primary'>{{ tag }}</v-chip>
  </v-card-actions>

</article>

</template>
<script>
import { mapGetters } from 'vuex'
import MyPicture from '~/components/MyPicture'
import { mdiRepeat, mdiCalendar, mdiMapMarker } from '@mdi/js'

export default {
  data() {
    return { mdiRepeat, mdiMapMarker, mdiCalendar }
  },
  components: {
    MyPicture
  },
  props: {
    event: { type: Object, default: () => ({}) },
    lazy: Boolean
  },
  computed: {
    ...mapGetters(['hide_thumbs']),
    isPast() {
      const now = new Date();
      console.log(now, this.event.start_datetime)
      if (this.event.end_datetime) {
        return new Date(this.event.end_datetime*1000) < now;
      } else {
        return new Date(this.event.start_datetime*1000) < now;
      }
    }
  }
}
</script>
