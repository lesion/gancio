<template lang="pug">
  v-card.h-event.event.mt-1
    nuxt-link(:to='`/event/${event.id}`')
      v-img(:src="`/media/thumb/${event.image_path}`"
        gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.7)"
        height="250" position="top top"
        class="white--text align-end")
        v-card-title {{event.title}}
    //- v-list-item
      v-list-item-content
        v-list-item-title.headline {{ event.title }}
        v-list-item-subtitle
          time(:datetime='event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")')  <v-icon>mdi-date</v-icon> {{ event|when }}
        v-list-item-subtitle
          span <v-icon>md-location-outline</v-icon> {{event.place.name}}
    v-card-text
      time(:datetime='event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")')  <v-icon>mdi-event</v-icon> {{ event|when }}
      div <v-icon>mdi-location-on</v-icon> {{event.place.name}}
      //- v-btn.ml-1(type='text' plain rounded size='mini' v-for='tag in event.tags' :key='tag' @click='addTag(tag)') {{tag}} -->
    v-card-actions
      v-chip.ml-1(v-for='tag in event.tags' link :key='tag' outlined color='primary' small) {{tag}}
      v-spacer
      v-btn(icon)
        v-icon mdi-bookmark
      v-btn(icon color='yellow')
        v-icon mdi-share-variant
      v-btn(icon color='primary' nuxt :to='`/event/${event.id}`')
        v-icon mdi-chevron-right

  //- <!-- //- v-card.event.h-event.mt-1(max-width="400")
  //-   p ciao
    //- nuxt-link(:to='`/event/${event.id}`')
    //- v-list-item
    //-   v-list-item-content
    //-     v-list-item-title(v-text='event.title')
    //-     v-list-item-subtitle
    //-       //-  when
    //-       time.d-block.dt-start.mt-0(:datetime='event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")')  <i class='el-icon-date'/> {{event|when}}
    //-       //- place
    //-       .p-location.mt-1.text-warning(plain size='mini' round type='text' @click='addPlace') <i class='el-icon-location-outline'/> {{event.place.name}}

    //-   v-img(v-if='showImage && event.image_path' height="194"
    //-     lazy :src='`/media/thumb/${event.image_path}`')
    //-   .float-right
    //-     i.text-danger.el-icon-refresh(v-if='event.parentId')
    //-     .badge.text-info(v-if='settings.enable_resources && event.resources && event.resources.length') {{event.resources.length}}
    //-   //- title
    //-   .p-name.p-summary.title {{event.title}}

    //- .card-body
    //-   //- div.d-flex.justify-content-between
    //-   //-  when
    //-   time.d-block.dt-start.mt-0(:datetime='event.start_datetime|unixFormat("YYYY-MM-DD HH:mm")')  <i class='el-icon-date'/> {{event|when}}
    //-   //- place
    //-   .p-location.mt-1.text-warning(plain size='mini' round type='text' @click='addPlace') <i class='el-icon-location-outline'/> {{event.place.name}}

    //-   //- description
    //-   //- .p-description.description.mt-3(v-html='description')

    //- .card-footer(v-if='event.tags.length')
    //-   v-btn.ml-1(type='text' plain rounded size='mini' v-for='tag in event.tags' :key='tag' @click='addTag(tag)') {{tag}} -->
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
  width: 300px;
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
  // .title::before {
    // content: "...";
    // position: absolute;
    // bottom: 0;
  //   right: 0;
  // }

  // .title::after {
  //   content: "";
  //   position: absolute;
  //   right: 0; /* note: not using bottom */
  //   width: 1rem;
  //   height: 1rem;
  //   background: white;
  // }
}

  // a:hover {
  //   text-decoration: none;
  //   .title {
  //     border-bottom: 1px solid #888;
  //     color: white;
  //   }
  // }
//   .title {
//     margin-left: 1rem;
//     margin-top: 1rem;
//     margin-right: 1rem;
//     border-bottom: 1px solid #333;
//     transition: border-color .5s;
//     font-size: 1.2em;
//     max-height: 3em;
//     overflow: hidden;
//     color: white;
//     font-weight: bold;
//   }

//   .card-footer {
//     max-height: 4.5em;
//     overflow: hidden;
//     padding: .25rem 0.5rem;
//     line-height: 1.8rem;
//     min-height: 2.2rem;
//   }

//   .card-body {
//     overflow: hidden;
//   }

//   .description {
//     color: #999;
//     font-size: 0.8em;
//     overflow: hidden;
//     max-height: 100%;
//   }

//   .el-image { width: 100% }
//   .v-image {
//     .v-image__image {
//       height: 250px;
//     }
//     height: 250px;
//     background-position: top;
//     // width: 100%;
//     // object-fit: cover;
//     // object-position: top;
//   }
// }

</style>
