<template lang="pug" functional>
  v-card.h-event.event
    nuxt-link(:to='`/event/${props.event.id}`')
      img(:src="`/media/thumb/${props.event.image_path || 'logo.png' }`")
      v-icon.float-right.mr-1(v-if='props.event.parentId' color='success') mdi-repeat
      .title.p-name {{props.event.title}}

    v-card-text.body
      time.dt-start.subtitle-1(:datetime='props.event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")')  {{ props.event|when }}
      .d-none.dt-end {{props.event.end_datetime|unixFormat('YYYY-MM-DD HH:mm')}}
      a.place.d-block.p-location.pl-0(text color='primary' @click="listeners['placeclick'](props.event.place.id)") <v-icon>mdi-map-marker</v-icon> {{props.event.place.name}}

    v-card-actions.actions.justify-space-between
      .tags
        v-chip.ml-1(v-for='tag in props.event.tags' small
          :key='tag' outlined color='primary' @click="listeners['tagclick'](tag)") {{tag}}

      v-menu(offset-y)
        template(v-slot:activator="{on}")
          v-btn.align-self-end(icon v-on='on' color='primary')
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
  display: flex;
  position: relative;
  flex-direction: column;
  width: 330px;
  max-width: 500px;
  transition: all .5s;
  flex-grow: 1;
  margin-top: .4em;
  margin-right: .4em;
  overflow: hidden;

  &:hover img {
    transform: scale(1.02);
  }

  .title {
    display: block;
    max-height: 4.2em;
    overflow: hidden;
    margin: 0.5rem 1rem 0.5rem 1rem;
    color: white;
    border-bottom: 1px solid #333;
    font-size: 1.2em !important;
    line-height: 1.4em;
    font-weight: 700;
  }

  .body {
    flex: 1 1 auto;
  }

  // .actions {
  //   justify-content: flex-end;
  //   overflow: hidden;
  //   align-content: flex-end;
  //   text-align: right;
  //   .tags {
  //     order: 0;
  //     flex-grow: 1;
  //     align-self:center;
  //     max-height: 1.6em;
  //     overflow: hidden;
  //   }
  // }

  img {
    transition: transform .2s ease;
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
