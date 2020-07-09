<template lang="pug">
  .card.event.h-event.mt-1.text-white
    nuxt-link(:to='`/event/${event.id}`')
      el-image(v-if='showImage && event.image_path'
        lazy :src='`/media/thumb/${event.image_path}`')
      .float-right
        i.text-danger.el-icon-refresh(v-if='event.parentId')
        .badge.text-info(v-if='settings.enable_resources && event.resources && event.resources.length') {{event.resources.length}}
      //- title
      .p-name.p-summary.title {{event.title}}

    .card-body
      //- div.d-flex.justify-content-between
      //-  when
      time.d-block.dt-start.mt-0(:datetime='event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")')  <i class='el-icon-date'/> {{event|when}}
      //- place
      .p-location.mt-1.text-warning(plain size='mini' round type='text' @click='addPlace') <i class='el-icon-location-outline'/> {{event.place.name}}

      //- description
      //- .p-description.description.mt-3(v-html='description')

    .card-footer(v-if='event.tags.length')
      el-button.ml-1(type='text' plain round size='mini' v-for='tag in event.tags' :key='tag' @click='addTag(tag)') {{tag}}
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
