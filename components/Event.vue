<template lang="pug">
  v-card.h-event.event.mt-1
    nuxt-link(:to='`/event/${event.id}`')
      v-img.align-end.white--text(:src="`/media/thumb/${event.image_path}`"
        gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.7)"
        height="250" position="top top")
        v-card-title {{event.title}}

    v-card-text
      time(:datetime='event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")')  <v-icon>mdi-event</v-icon> {{ event|when }}
      div <v-icon>mdi-location-on</v-icon> {{event.place.name}}

    v-card-actions
      v-chip.ml-1(v-for='tag in event.tags' link
        :key='tag' outlined color='primary' small @click='addTag(tag)') {{tag}}
      v-spacer

      v-menu(offset-y)
        template(v-slot:activator="{on}")
          v-btn(icon v-on='on' color='primary')
            v-icon mdi-dots-vertical
        v-list
          v-list-item
            v-list-item-title test

</template>
<script>
import { mapState, mapActions } from 'vuex'

export default {
  props: {
    event: { type: Object, default: () => ({}) },
    showTags: {
      type: Boolean,
      default: true
    },
    showImage: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapState(['settings', 'filters']),
    description () {
      return this.event.description.replace(/(<br>)+/g, '<br>')
    },
    show_footer () {
      return (this.event.tags.length || this.event.resources.length)
    }
  },
  methods: {
    ...mapActions(['setSearchTags', 'setSearchPlaces']),
    addTag (tag) {
      if (this.filters.tags.includes(tag)) {
        this.setSearchTags(this.filters.tags.filter(t => t !== tag))
      } else {
        this.setSearchTags(this.filters.tags.concat([tag]))
      }
    },
    addPlace () {
      const place = this.event.place.id
      if (this.filters.places.includes(place)) {
        this.setSearchPlaces(this.filters.places.filter(p => p !== place))
      } else {
        this.setSearchPlaces(this.filters.places.concat(place))
      }
    }
  }
}
</script>
<style lang="less" scoped>
.event {
  width: 330px;
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