<template lang="pug">
    v-card(max-width='350')
      //- image
      nuxt-link(:to='`/event/${event.slug || event.id}`' target='_blank' :class='{ withImg: event.media }')
        v-img(v-if='event.media' aspect-ratio='1.7778' :src='thumbnail' :position='thumbnailPosition' :alt='event.media.length ? event.media[0].name : ""')
        v-card-title {{event.title}}

      v-card-text
        .date {{event|when}}<br/>

        //- date / place
        .date {{event.place.name}}
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

</template>
<script>

export default {
  layout: 'iframe',
  async asyncData ({ $axios, params, error, store }) {
    try {
      const event = await $axios.$get(`/event/${params.event_id}`)
      return { event }
    } catch (e) {
      error({ statusCode: 404, message: 'Event not found' })
    }
  },
  computed: {
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
    }
  },
  data () {
    return {
      settings: { baseurl: '' },
      loading: true
    }
  }
}

// <iframe src='http://localhost:13120/embed/1' class='embedded_gancio'></iframe>
</script>
// <style lang='less'>
// .embed_event {
//   display: flex;
//   transition: margin .1s;
//   background: url('/favicon.ico') no-repeat right 5px bottom 5px;
//   background-size: 32px;
//   background-color: #1f1f1f;
//   text-decoration: none;
//   border: 1px solid #b1a3a3;
//   margin: 0px auto;
//   padding: 0px;
//   width: 400px;
//   height: 210px;
//   overflow: hidden;
//   border-radius: 10px;
//   // transition: all .2s;
//   margin: 0px;

//   &:hover {
//     transform: prospective(10) translateX(10);
//     margin-left: 5px;
//     text-decoration: none;
//   }

//   .event-info {
//     height: 100%;
//     color: #eee !important;
//     flex-direction: column;
//     padding: 5px;

//     .date {
//       color: #999;
//     }
//   }

//   img {
//     width: 150px;
//     object-fit: cover;
//     object-position: top;
//     margin-right: 5px;
//     height: 100%;
//   }

// }
// </style>
