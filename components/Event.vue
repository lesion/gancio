<template lang="pug">
  v-card.h-event.event
    nuxt-link(:to='`/event/${event.id}`')
      v-img.img(:src="`/media/thumb/${event.image_path || 'logo.png' }`")
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
<style lang="less">
.event {
  display: flex;
  position: relative;
  flex-direction: column;
  width: 330px;
  max-width: 500px;
  flex-grow: 1;
  margin-top: .4em;
  margin-right: .4em;
  overflow: hidden;

  .title {
    display: block;
    max-height: 3.3em;
    overflow: hidden;
    margin: 0.5rem 1rem 0.5rem 1rem;
    // color: white;
    border-bottom: 1px solid rgba(4,4,4,0.2);
    font-size: 1.2em !important;
    line-height: 1.1em;
    font-weight: 500;
  }

  .body {
    flex: 1 1 auto;
  }

  .img {
    width: 100%;
    max-height: 250px;
    object-fit: cover;
    object-position: top;
  }

  .place {
    max-width: 100%;
    span {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  a {
    text-decoration: none;
  }
}
</style>
