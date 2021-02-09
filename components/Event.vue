<template lang="pug" functional>
  v-card.h-event.event
    nuxt-link(:to='`/event/${props.event.id}`')
      v-img.align-end(:src="`/media/thumb/${props.event.image_path || 'logo.png' }`"
        height="250" position="top top" )
        v-icon.float-right(v-if='props.event.parentId' color='success') mdi-repeat
  v-card-title.p-name.pb-0 {{props.event.title}}

    //- gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.7), rgba(0,0,0,.9)"
    v-card-text.pb-0
      time.dt-start.subtitle-1(:datetime='props.event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")')  {{ props.event|when }}
      .d-none.dt-end {{props.event.end_datetime|unixFormat('YYYY-MM-DD HH:mm')}}
      v-btn.place.d-block.p-location.pl-0(text color='primary' @click="listeners['placeclick'](props.event.place.id)") <v-icon>mdi-map-marker</v-icon> {{props.event.place.name}}

    v-card-actions
      v-chip.ml-1(v-for='tag in props.event.tags' link small
        :key='tag' outlined color='primary' @click="listeners['tagclick'](tag)") {{tag}}
      v-spacer

      v-menu(offset-y)
        template(v-slot:activator="{on}")
          v-btn(icon v-on='on' color='primary')
            v-icon mdi-dots-vertical
        v-list(dense)
          v-list-item-group
            v-list-item(v-clipboard:success="() => parent.$root.$message('common.copied', { color: 'success' })"
                  v-clipboard:copy='`${parent.settings.baseurl}/event/${props.event.id}`')
              v-list-item-icon
                v-icon mdi-content-copy
              v-list-item-content
                v-list-item-title {{parent.$t('common.copy_link')}}
            v-list-item(:href='`/api/event/${props.event.id}.ics`')
              v-list-item-icon
                v-icon mdi-calendar-export
              v-list-item-content
                v-list-item-title {{parent.$t('common.add_to_calendar')}}

</template>
<script>

export default {
  props: {
    event: { type: Object, default: () => ({}) }
  }
}
</script>
<style lang="less">
.event {
  width: 330px;
  height: 380px;
  max-width: 500px;
  flex-grow: 1;
  margin-top: .3em;
  margin-left: .3em;

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
