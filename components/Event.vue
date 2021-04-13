<template lang="pug">
  v-card.h-event.event
    nuxt-link(:to='`/event/${event.slug || event.id}`')
      v-img.img(:src="`/media/thumb/${event.image_path || 'logo.svg' }`")
      v-icon.float-right.mr-1(v-if='event.parentId' color='success') mdi-repeat
      .title.p-name {{event.title}}

    v-card-text.body.pt-0.pb-0
      time.dt-start.subtitle-1(:datetime='event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")')  <v-icon>mdi-calendar</v-icon> {{ event|when }}
      .d-none.dt-end {{event.end_datetime|unixFormat('YYYY-MM-DD HH:mm')}}
      a.place.d-block.p-location.pl-0(text color='primary' @click="$emit('placeclick', event.place.id)") <v-icon>mdi-map-marker</v-icon> {{event.place.name}}

    v-card-actions.actions.justify-space-between
      .tags
        v-chip.ml-1.px-2(v-for='tag in event.tags' small
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

</template>
<script>
import { mapState } from 'vuex'

export default {
  props: {
    event: { type: Object, default: () => ({}) }
  },
  computed: mapState(['settings'])
}
</script>
