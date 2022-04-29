<template lang="pug">
  v-card.h-event.event.d-flex(itemscope itemtype="https://schema.org/Event")
    nuxt-link(:to='`/event/${event.slug || event.id}`' itemprop="url")
      MyPicture(:event='event' thumb :lazy='lazy')
      v-icon.float-right.mr-1(v-if='event.parentId' color='success' v-text='mdiRepeat')
      .title.p-name(itemprop="name") {{event.title}}

    v-card-text.body.pt-0.pb-0
      time.dt-start.subtitle-1(:datetime='event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")' itemprop="startDate" :content="event.start_datetime|unixFormat('YYYY-MM-DDTHH:mm')")  <v-icon v-text='mdiCalendar'></v-icon> {{ event|when }}
      .d-none.dt-end(itemprop="endDate" :content="event.end_datetime|unixFormat('YYYY-MM-DDTHH:mm')") {{event.end_datetime|unixFormat('YYYY-MM-DD HH:mm')}}
      a.place.d-block.p-location.pl-0(text color='primary' @click="$emit('placeclick', event.place.id)" itemprop="location" :content="event.place.name") <v-icon v-text='mdiMapMarker'></v-icon> {{event.place.name}}
      .d-none(itemprop='location.address') {{event.place.address}}

    v-card-actions.pt-0.actions.justify-space-between
      .tags
        v-chip.ml-1.mt-1(v-for='tag in event.tags.slice(0,6)' small
          :key='tag' outlined color='primary' @click="$emit('tagclick', tag)") {{tag}}

      client-only
        v-menu(offset-y)
          template(v-slot:activator="{on}")
            v-btn.align-self-end(icon v-on='on' color='primary' title='more' aria-label='more')
              v-icon(v-text='mdiDotsVertical')
          v-list(dense)
            v-list-item-group
              v-list-item(@click='clipboard(`${settings.baseurl}/event/${event.slug || event.id}`)')
                v-list-item-icon
                  v-icon(v-text='mdiContentCopy')
                v-list-item-content
                  v-list-item-title {{$t('common.copy_link')}}
              v-list-item(:href='`/api/event/${event.slug || event.id}.ics`')
                v-list-item-icon
                  v-icon(v-text='mdiCalendarExport')
                v-list-item-content
                  v-list-item-title {{$t('common.add_to_calendar')}}
              v-list-item(v-if='is_mine' :to='`/add/${event.id}`')
                v-list-item-icon
                  v-icon(v-text='mdiPencil')
                v-list-item-content
                  v-list-item-title {{$t('common.edit')}}
              v-list-item(v-if='is_mine' @click='remove(false)')
                v-list-item-icon
                  v-icon(color='error' v-text='mdiDeleteForever')
                v-list-item-content
                  v-list-item-title {{$t('common.remove')}}
        template(#placeholder)
          v-btn.align-self-end(icon color='primary' aria-label='more')
            v-icon(v-text='mdiDotsVertical')                
</template>
<script>
import { mapState } from 'vuex'
import clipboard from '../assets/clipboard'
import MyPicture from '~/components/MyPicture'
import { mdiRepeat, mdiPencil, mdiDotsVertical, mdiContentCopy,
  mdiCalendarExport, mdiDeleteForever, mdiCalendar, mdiMapMarker } from '@mdi/js'

export default {
  data () {
    return { mdiRepeat, mdiPencil, mdiDotsVertical, mdiContentCopy, mdiCalendarExport,
      mdiDeleteForever, mdiMapMarker, mdiCalendar }
  },
  components: {
    MyPicture
  },
  props: {
    event: { type: Object, default: () => ({}) },
    lazy: Boolean
  },
  mixins: [clipboard],
  computed: {
    ...mapState(['settings']),
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
      const ret = await this.$root.$confirm('event.remove_confirmation')
      if (!ret) { return }
      await this.$axios.delete(`/event/${this.event.id}`)
      this.$emit('destroy', this.event.id)
      this.$root.$message('admin.event_remove_ok')
      
    }
  }
}
</script>
