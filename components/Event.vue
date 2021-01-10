<template lang="pug" functional>
  v-card.h-event.event.mt-1
    template(v-if='props.show')
      nuxt-link(:to='`/event/${props.event.id}`')
        v-img.align-end.white--text(:src="`/media/thumb/${props.event.image_path}`"
          gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.7), rgba(0,0,0,.9)"
          height="250" position="top top")
          v-card-title.text-h5.p-name {{props.event.title}}

      v-card-text
        v-icon.float-right(v-if='props.event.parentId' color='success') mdi-repeat
        //- time.text-h6.dt-start(:datetime='props.event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")')  <v-icon>mdi-event</v-icon> {{ event|when }}
        .d-none.dt-end {{props.event.end_datetime|unixFormat('YYYY-MM-DD HH:mm')}}
        v-btn.d-block.text-h6.p-location(text color='primary' big @click="$emit('placeclick', props.event.place.id)") <v-icon>mdi-map-marker</v-icon> {{props.event.place.name}}

      v-card-actions
        v-chip.ml-1(v-for='tag in props.event.tags' link
          :key='tag' outlined color='primary' @click="$emit('tagclick',tag)") {{tag}}
        v-spacer

        v-menu(offset-y)
          template(v-slot:activator="{on}")
            v-btn(icon v-on='on' color='primary')
              v-icon mdi-dots-vertical
          v-list(dense)
            v-list-item-group
              v-list-item(v-clipboard:success='copyLink'
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
// import { mapState, mapActions } from 'vuex'

export default {
  props: {
    event: { type: Object, default: () => ({}) },
    show: { type: Boolean }
  }
  // computed: {
  //   ...mapState(['settings']),
  //   show_footer () {
  //     return (this.event.tags.length || this.event.resources.length)
  //   }
  // },
  // methods: {
  //   ...mapActions(['setSearchTags', 'setSearchPlaces']),
  //   copyLink () {
  //     this.$root.$message('common.copied', { color: 'success' })
  //   },
  //   addTag (tag) {
  //     if (this.filters.tags.includes(tag)) {
  //       this.setSearchTags(this.filters.tags.filter(t => t !== tag))
  //     } else {
  //       this.setSearchTags(this.filters.tags.concat([tag]))
  //     }
  //   },
  //   addPlace () {
  //     const place = this.event.place.id
  //     if (this.filters.places.includes(place)) {
  //       this.setSearchPlaces(this.filters.places.filter(p => p !== place))
  //     } else {
  //       this.setSearchPlaces(this.filters.places.concat(place))
  //     }
  //   }
  // }
}
</script>
<style lang="less">
.event {
  width: 330px;
  height: 370px;
  max-width: 450px;
  flex-grow: 1;
  margin: .2em;
  // background-color: #202020;
  // overflow: hidden;
  .title {
    line-height: 1.2em;
    max-height: 2.4em;
    overflow: hidden;
  }

  a {
    text-decoration: none;
  }
}
</style>
