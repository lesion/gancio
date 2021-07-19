<template lang="pug">
  v-card.h-event.event.d-flex
    nuxt-link(:to='`/event/${event.slug || event.id}`')
      v-img.u-featured.img(v-if='event.media' aspect-ratio='1.7778' :src='thumbnail' :position='thumbnailPosition' :alt='event.media.length ? event.media[0].name : ""')
      v-icon.float-right.mr-1(v-if='event.parentId' color='success') mdi-repeat
      .title.p-name {{event.title}}

    v-card-text.body.pt-0.pb-0
      time.dt-start.subtitle-1(:datetime='event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")')  <v-icon>mdi-calendar</v-icon> {{ event|when }}
      .d-none.dt-end {{event.end_datetime|unixFormat('YYYY-MM-DD HH:mm')}}
      a.place.d-block.p-location.pl-0(text color='primary' @click="$emit('placeclick', event.place.id)") <v-icon>mdi-map-marker</v-icon> {{event.place.name}}

    v-card-actions.pt-0.actions.justify-space-between
      .tags
        v-chip.ml-1.mt-1(v-for='tag in event.tags.slice(0,6)' small
          :key='tag' outlined color='primary' @click="$emit('tagclick', tag)") {{tag}}

      v-menu(offset-y)
        template(v-slot:activator="{on}")
          v-btn.align-self-end(icon v-on='on' color='primary')
            v-icon mdi-dots-vertical
        v-list(dense)
          v-list-item-group
            v-list-item(v-clipboard:success="() => $root.$message('common.copied', { color: 'success' })"
                  v-clipboard:copy='`${settings.baseurl}/event/${event.id}`')
              v-list-item-icon
                v-icon mdi-content-copy
              v-list-item-content
                v-list-item-title {{$t('common.copy_link')}}
            v-list-item(:href='`/api/event/${event.id}.ics`')
              v-list-item-icon
                v-icon mdi-calendar-export
              v-list-item-content
                v-list-item-title {{$t('common.add_to_calendar')}}
            v-list-item(v-if='is_mine' :to='`/add/${event.id}`')
              v-list-item-icon
                v-icon mdi-pencil
              v-list-item-content
                v-list-item-title {{$t('common.edit')}}
            v-list-item(v-if='is_mine' @click='remove(false)')
              v-list-item-icon
                v-icon(color='error') mdi-delete-forever
              v-list-item-content
                v-list-item-title {{$t('common.remove')}}
</template>
<script>
import { mapState } from 'vuex'

export default {
  props: {
    event: { type: Object, default: () => ({}) }
  },
  computed: {
    ...mapState(['settings']),
    thumbnail () {
      let path
      if (this.event.media && this.event.media.length) {
        path = this.event.media[0].url
      } else {
        path = 'logo.svg'
      }
      return '/media/thumb/' + path
    },
    thumbnailPosition () {
      if (this.event.media && this.event.media.length && this.event.media[0].focalpoint) {
        const focalpoint = this.event.media[0].focalpoint
        return `${(focalpoint[0] + 1) * 50}% ${(focalpoint[1] + 1) * 50}%`
      }
      return 'center center'
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
      const ret = await this.$root.$confirm('event.remove_confirmation')
      if (!ret) { return }
      await this.$axios.delete(`/event/${this.event.id}`)
      this.$emit('destroy', this.event.id)
    }
  }
}
</script>
