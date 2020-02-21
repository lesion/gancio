<template lang="pug">
  .card.event.h-event.mt-1.text-white(body-style='padding: 0px;')
    nuxt-link(:to='`/event/${event.id}`')
      el-image(v-if='showImage && event.image_path'
        lazy :src='`/media/thumb/${event.image_path}`')
      .float-right
        i.text-danger.el-icon-refresh(v-if='event.parentId')
        .badge.text-info(v-if='settings.enable_resources && event.resources && event.resources.length') {{event.resources.length}}
      .p-name.p-summary.title {{event.title}}

    .card-body
      //-  when
      div
        i.el-icon-date
        time.dt-start(:datetime='event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")')  {{event|when}}

      //- place
      el-button.p-location.mt-1.bg-dark.text-warning.float-right(plain size='mini' round type='text' icon='el-icon-location-outline' @click='addPlace') {{event.place.name}}

      //- description
      .description.p-description.mt-3(v-if='!event.image_path || !event.tags.length' v-html='description')

    .card-footer(v-if='event.tags.length')
      el-button.ml-1.bg-dark(type='text' plain round size='mini' v-for='tag in event.tags' :key='tag' @click='addTag(tag)') {{tag}}
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
      return this.event.description.slice(0, 500)
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
<style lang='less'>
.event {
  width: 320px;
  max-width: 450px;
  flex-grow: 1;
  margin: .2em;
  background-color: #202020;

  a:hover {
    text-decoration: none;
    .title {
      border-bottom: 1px solid #888;
      color: white;
    }
  }

  .title {
    margin-left: 1rem;
    margin-top: 1rem;
    margin-right: 1rem;
    border-bottom: 1px solid #333;
    transition: border-color .5s;
    font-size: 1.2em;
    max-height: 3em;
    overflow: hidden;
    color: #fea;
  }

  .card-footer {
    max-height: 4.5em;
    overflow: hidden;
    padding: .25rem 0.5rem;
    line-height: 1.8rem;
    min-height: 2.2rem;
  }
  .description {
    color: #999;
    font-size: 0.8em;
    p {
      margin: 0px;
    }
  }

  .el-image { width: 100% }
  img {
    width: 100%;
    max-height: 250px;
    object-fit: cover;
    object-position: top;
  }
}
</style>
